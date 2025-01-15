import mysql from 'mysql2/promise';

const dbConfig = {
    host: '150.140.186.118',
    port: 3306,
    user: 'readonly_student',
    password: 'iot_password',
    database: 'default'
};

async function testFetchData(tableName, attrName, startDatetime, endDatetime) {
    try {
        const results = await fetchData(
            tableName,
            attrName,
            startDatetime,
            endDatetime
        );
        console.log(results);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

testFetchData('v3_omada14_fanari_0_TrafficLight',
    'waitingCars',
    '2025-01-08 23:57:00',
    '2025-01-14 00:03:00');

async function fetchData(tableName, attrName, startDatetime = null, endDatetime = null) {
    const connection = await mysql.createConnection(dbConfig);

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
    } finally {
        await connection.end();
    }
}