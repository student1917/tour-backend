import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import axios from 'axios';
import crypto from 'crypto';


export const payWithCash = async(req, res) => {
    
    try {
        const {bookingId, amount} = req.body

        const booking = await Booking.findById(bookingId).populate('user')
        if (!booking)
            return res.status(404).json({message:'Booking not found'})

            const orderId = 'CASH' + Date.now()
            const transactionId = `CASH_TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            
            const payment = new Payment({
                orderId,
                bookingId,
                amount,
                paymentMethod: 'cash',
                status: 'confirmed',
                paymentTime: new Date(),
                transactionId,
                })

            await payment.save()
            booking.paymentId = payment._id;
            booking.status = 'confirmed';
            await booking.save();

            await Service.findByIdAndUpdate(booking.service, {
                $inc: { bookedCount: 1 },
              });

            res.status(200).json({
                success:true, 
                data: { payment, booking }
            })
            
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success:false,
            message:'Error'
        })
    }
}

// pay via Momo
export const createMomoPayment = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    const {
      MOMO_PARTNER_CODE,
      MOMO_ACCESS_KEY,
      MOMO_SECRET_KEY,
      MOMO_REDIRECT_URL,
      MOMO_IPN_URL,
      MOMO_API_URL
    } = process.env;

    const requestType = 'payWithMethod';
    const orderId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const orderInfo = `Pay for order ${orderId}`;

    const rawSignature = 
      `accessKey=${MOMO_ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=` +
      `&ipnUrl=${MOMO_IPN_URL}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${MOMO_PARTNER_CODE}` +
      `&redirectUrl=${MOMO_REDIRECT_URL}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const payload = {
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: MOMO_REDIRECT_URL,
      ipnUrl: MOMO_IPN_URL,
      extraData: '',
      requestType,
      signature,
      lang: 'vi',
    };

    const momoRes = await axios.post(MOMO_API_URL, payload);

    await Payment.create({
      bookingId,
      paymentMethod: 'momo',
      orderId,
      requestId,
      amount,
      status: 'pending',
    });

    return res.status(200).json({ payUrl: momoRes.data.payUrl });
  } catch (err) {
    console.error('[Momo Payment Error]:', err);
    return res.status(500).json({ message: 'Momo payment error', error: err.message });
  }
};

export const handleMomoIPN = async (req, res) => {
  console.log("🔥 MoMo IPN HIT:", req.method, req.body);  
    try {
      const data = req.body;
      const {
        MOMO_ACCESS_KEY,
        MOMO_SECRET_KEY
      } = process.env;
  
      const rawSignature = 
        `accessKey=${MOMO_ACCESS_KEY}` +
        `&amount=${data.amount}` +
        `&extraData=${data.extraData}` +
        `&message=${data.message}` +
        `&orderId=${data.orderId}` +
        `&orderInfo=${data.orderInfo}` +
        `&orderType=${data.orderType}` +
        `&partnerCode=${data.partnerCode}` +
        `&payType=${data.payType}` +
        `&requestId=${data.requestId}` +
        `&responseTime=${data.responseTime}` +
        `&resultCode=${data.resultCode}` +
        `&transId=${data.transId}`;
  
      const signature = crypto
        .createHmac('sha256', MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest('hex');
  
      if (signature !== data.signature) {
        return res.status(400).send('Invalid signature');
      }
  
      const payment = await Payment.findOneAndUpdate(
        { orderId: data.orderId },
        {
          status: data.resultCode === 0 ? 'success' : 'failed',
          responseData: data,
        },
        { new: true }
      );
  
      if (data.resultCode === 0 && payment) {
        await Booking.findByIdAndUpdate(payment.bookingId, { status: 'paid' });
      }
  
      return res.status(200).json({ message: 'IPN processed' });
    } catch (err) {
      console.error('[Momo IPN Error]:', err);
      return res.status(500).json({ message: 'Failed to process IPN' });
    }
  };


