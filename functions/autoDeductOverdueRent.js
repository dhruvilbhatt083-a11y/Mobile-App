// functions/autoDeductOverdueRent.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

function daysBetween(startTs, endTs) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endTs.toDate().getTime() - startTs.toDate().getTime()) / msPerDay);
}

exports.autoDeductOverdueRent = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const confirmedQuery = db.collection('bookings').where('status', '==', 'confirmed');

    const snap = await confirmedQuery.get();
    console.log('Found', snap.size, 'confirmed bookings');

    const commits = [];

    for (const doc of snap.docs) {
      const bookingId = doc.id;
      const data = doc.data();

      // Guards
      const confirmedAt = data.confirmedAt || data.createdAt || null;
      if (!confirmedAt) {
        console.log(`skip ${bookingId} — no confirmedAt`);
        continue;
      }

      const dailyRate = Number(data.dailyRate || 0);
      const rentDueAmount = Number(data.rentDueAmount || data.totalEstimatedRent || 0);
      const depositRemaining = typeof data.depositRemaining === 'number' ? data.depositRemaining : (typeof data.depositAmount === 'number' ? data.depositAmount : 0);
      const reminderSentAt = data.reminderSentAt || null;

      const daysSinceConfirm = daysBetween(confirmedAt, now);

      // 1) Send reminder if >=5 days and not sent and rent due
      if (daysSinceConfirm >= 5 && !reminderSentAt && rentDueAmount > 0) {
        console.log(`Booking ${bookingId}: sending reminder`);
        commits.push(db.doc(`bookings/${bookingId}`).update({
          reminderSentAt: now
        }));
        commits.push(db.collection(`bookings/${bookingId}/notifications`).add({
          type: 'rent_reminder',
          message: 'Please clear rent for the first 5 days within 3 days to avoid deposit deduction.',
          createdAt: now,
          createdBy: 'system'
        }));
        continue;
      }

      // 2) If reminder was sent and >=3 days passed since reminder AND rent still unpaid -> auto deduct
      if (reminderSentAt) {
        const daysSinceReminder = daysBetween(reminderSentAt, now);
        if (daysSinceReminder >= 3 && rentDueAmount > 0) {
          const overdueDays = Math.max(0, daysSinceConfirm - 5);
          if (overdueDays <= 0) continue;

          const unpaidForOverdue = Math.min(rentDueAmount, dailyRate * overdueDays);
          if (unpaidForOverdue <= 0) continue;

          const deduction = Math.min(depositRemaining, unpaidForOverdue);
          const newDepositRemaining = depositRemaining - deduction;
          const newRentDue = Math.max(0, rentDueAmount - deduction);

          console.log(`Booking ${bookingId}: overdueDays=${overdueDays} unpaid=${unpaidForOverdue} deduct=${deduction}`);

          const batch = db.batch();
          const bookingRef = db.doc(`bookings/${bookingId}`);

          // Create transaction
          const txRef = db.collection(`bookings/${bookingId}/transactions`).doc();
          batch.set(txRef, {
            amount: deduction,
            type: 'deduction',
            method: 'deposit_adjustment',
            status: 'success',
            reference: `auto_deduction_${now.toDate().toISOString().slice(0,10)}`,
            createdBy: 'system',
            createdAt: now
          });

          // Update booking
          const updatePayload = {
            depositRemaining: newDepositRemaining,
            rentDueAmount: newRentDue,
            lastAutoDeductionAt: now,
            terminationAutoAt: now,
            status: 'terminated'
          };

          if (deduction < unpaidForOverdue) {
            updatePayload.debtAmount = (unpaidForOverdue - deduction) + (data.debtAmount || 0);
          } else {
            updatePayload.debtAmount = data.debtAmount || null;
          }

          batch.update(bookingRef, updatePayload);

          // Reset car availability if you have carId
          if (data.carId) {
            const carRef = db.doc(`cars/${data.carId}`);
            batch.update(carRef, {
              available: true,
              currentBookingId: admin.firestore.FieldValue.delete()
            });
          }

          // Admin task
          const adminTaskRef = db.collection('adminTasks').doc();
          batch.set(adminTaskRef, {
            bookingId,
            type: 'auto_termination',
            message: `Auto-terminated booking ${bookingId}. Deducted ${deduction} from deposit.`,
            createdAt: now,
            processed: false
          });

          commits.push(batch.commit());
        }
      }
    }

    await Promise.all(commits);
    console.log('autoDeductOverdueRent finished');
    return null;
  });
