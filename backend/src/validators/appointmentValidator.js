import { body, validationResult } from 'express-validator';

export const validateAppointment = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('doctorId').isUUID().withMessage('Valid doctor ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Valid appointment date is required (ISO 8601)'),
  body('type')
    .optional()
    .isIn(['in_person', 'video', 'phone'])
    .withMessage('Type must be in_person, video, or phone'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
