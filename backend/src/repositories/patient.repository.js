const db = require('../config/db');

class PatientRepository {
    async createPatient(patientData, client = db){
        const {
            userId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            bloodGroup,
            phone,
            address,
            emergencyContactName,
            emergancyContactPhone,
        } = patientData;

        const query = `
        INSERT INTO patients(
        user_id, first_name, last_name, date_of_birth, gender, blood_group, phone, address, emergency_contact_name, emergency_contact_phone)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING patient_id, user_id, first_name, last_name, registered_at;
        `;

        const values = [
            userId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            bloodGroup || null,
            phone,
            address || null,
            emergencyContactName || null,
            emergancyContactPhone || null,
        ]

        const res = client.query(query, values);
        return res.rows[0];
    }
}

module.exports = new PatientRepository();