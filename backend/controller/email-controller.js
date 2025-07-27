import Email from '../model/email.js';

export const saveSentEmail = async (request, response) => {
  try {
    const email = new Email(request.body);
    await email.save();
    response
      .status(200)
      .json({ message: 'Email saved successfully', id: email._id });
  } catch (error) {
    console.error('Error saving email:', error);
    response.status(500).json({ error: error.message });
  }
};

export const getEmails = async (request, response) => {
  try {
    let emails;
    const { type } = request.params;

    switch (type) {
      case 'starred':
        emails = await Email.find({ starred: true, bin: false });
        break;
      case 'bin':
        emails = await Email.find({ bin: true });
        break;
      case 'allmail':
        emails = await Email.find({});
        break;
      case 'inbox':
        emails = await Email.find({ type: 'inbox', bin: false });
        break;
      default:
        emails = await Email.find({ type: type, bin: false });
    }

    response.status(200).json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    response.status(500).json({ error: error.message });
  }
};

export const moveToBin = async (request, response) => {
  try {
    await Email.updateMany(
      { _id: { $in: request.body } },
      { $set: { bin: true, starred: false, type: '' } }
    );
    response.status(200).json({ message: 'Emails moved to bin successfully' });
  } catch (error) {
    console.error('Error moving emails to bin:', error);
    response.status(500).json({ error: error.message });
  }
};

export const starredEmail = async (request, response) => {
  try {
    await Email.updateOne(
      { _id: request.body.id },
      { $set: { starred: request.body.value } }
    );
    response.status(200).json({ message: 'Email star status updated' });
  } catch (error) {
    console.error('Error updating star status:', error);
    response.status(500).json({ error: error.message });
  }
};

export const deleteEmail = async (request, response) => {
  try {
    await Email.deleteMany({ _id: { $in: request.body } });
    response.status(200).json({ message: 'Emails deleted permanently' });
  } catch (error) {
    console.error('Error deleting emails:', error);
    response.status(500).json({ error: error.message });
  }
};
