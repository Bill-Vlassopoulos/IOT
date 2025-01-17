import mysql from 'mysql2/promise';

const dbConfig = {
    host: '150.140.186.118',
    port: 3306,
    user: 'readonly_student',
    password: 'iot_password',
    database: 'default'
};

let connection;

async function connectToDatabase() {
    if (!connection || connection.connection._closing) {
        connection = await mysql.createConnection(dbConfig);
    }
}

export async function fetchData(tableName, attrName, startDatetime = null, endDatetime = null) {
    await connectToDatabase();

    try {
        let query = `
            SELECT recvTime, attrValue
            FROM ${tableName} 
            WHERE attrName = ?
        `;

        const params = [attrName];

        if (startDatetime) {
            query += " AND recvTime >= ?";
            params.push(startDatetime);
        }
        if (endDatetime) {
            query += " AND recvTime <= ?";
            params.push(endDatetime);
        }

        const [results] = await connection.execute(query, params);
        return results;
    } catch (err) {
        throw new Error('Error fetching data: ' + err.message);
    }
}

// Example usage
async function testFetchData() {
    try {
        const results = await fetchData(
            'v3_omada14_fanari_0_TrafficLight',
            'waitingCars',
            '2025-01-08 23:57:00',
            '2025-01-14 00:03:00'
        );
        console.log(results);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
