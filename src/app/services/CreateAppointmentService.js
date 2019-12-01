import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';

import Notification from '../schemas/Notification';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';
import Cache from '../../lib/cache';

class CreateAppointmentService {
  async run({ provider_id, user_id, date, connectedUsers, io }) {
    if (provider_id === user_id) {
      return res
        .status(401)
        .json({ error: 'You can not make an appointment with yourself.' });
    }
    /**
     * Check if provider_id is a provider
     */
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      throw new Error('You can only create appointments with providers.');
      // return res
      //  .status(401)
      //  .json({ error: 'You can only create appointments with providers.' });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('past date not permitted.');
      // return res.status(400).json({ error: 'past date not permitted.' });
    }

    /**
     * Check date Availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new Error('Appointment date is not available.');
      /* return res
        .status(400)
        .json({ error: 'Appointment date is not available.' });
        */
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });
    /**
     * Notify appointment provider
     * */

    const user = await User.findByPk(user_id);

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', as' H:MM'h'",
      { locale: pt }
    );

    const notification = await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });
    const ownerSocket = connectedUsers[provider_id];

    if (ownerSocket) {
      io.to(ownerSocket).emit('notification', notification);
    }

    /**
     * Invalidate Cache
     */
    await Cache.invalidatePrefix(`user:${user.id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();
