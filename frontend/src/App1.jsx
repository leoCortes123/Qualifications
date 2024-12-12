import moment from 'moment';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

const App = () => {
  const [files, setFiles] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const minDate = '2024-09-01';
  const headerMapping = {
    "Componente": "componente",
    "Contexto del evento": "contextodelevento",
    "Descripción": "descripcion",
    "Dirección IP": "ip",
    "Hora": "hora",
    "Nombre completo del usuario": "nombrecompletodelusuario",
    "Nombre evento": "nombreevento",
    "Origen": "origen",
    "Otro": "otro",
    "Usuario afectado": "usuarioafectado"
  };

  useEffect(() => {
    getReportCard();
  }, []);

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleUpload = async () => {
    for (let file of files) {
      const group = getGroup(file.name);
      if (file) {
        try {
          const results = await parseFile(file);

          const data = results.data.map(row => {
            const mappedRow = {};
            for (const key in row) {
              if (headerMapping[key]) {
                mappedRow[headerMapping[key]] = row[key];
              } else {
                mappedRow[key] = row[key];
              }
            }

            if (mappedRow.componente === 'Evidencia' && ['Se ha enviado una entrega', 'Se ha calificado el envío.'].includes(mappedRow.nombreevento)) {
              const [date, time] = mappedRow.hora.split(', ');
              const formattedDate = moment(date, 'D/MM/YY').format('YYYY-MM-DD');
              if (formattedDate < minDate) return null;

              const { ga, aa, ev, code } = parseActivity(mappedRow.contextodelevento);

              // Crear registro en la tabla Registration
              const newRow = {
                date: formattedDate,
                time: time,
                group: group,
                ga: ga,
                aa: aa,
                ev: ev,
                code: code,
                contextodelevento: mappedRow.contextodelevento,
                user: mappedRow.nombrecompletodelusuario.trim(),
                userAfected: mappedRow.usuarioafectado.trim(),
                substate: mappedRow.nombreevento === 'Se ha calificado el envío.' ? 1 : 2
              };

              return newRow;
            } else {
              return null;
            }
          }).filter(row => row !== null);

          sendData(data, group);
        } catch (error) {
          console.error("Error parsing file:", file.name, error);
        }
      }
    }
  };

  const getGroup = (fileName) => {
    const groupMatch = fileName.match(/V_(\d+)_R/);
    const group = groupMatch ? groupMatch[1] : null;
    return group;
  };

  const parseActivity = (contextodelevento) => {
    const regex = /GA(\d{1,2})-(\d{9})-AA(\d{1,2})-EV(\d{1,2})/i;
    const match = contextodelevento.match(regex);
    if (match) {
      return {
        ga: match[1],
        code: match[2],
        aa: match[3],
        ev: match[4]
      };
    } else {
      throw new Error('Invalid code format');
    }
  };

  const sendData = async (data, group) => {
    console.log('sendendData group:', group);
    fetch('http://localhost:3001/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'group': group,
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('SendData respuesta exitosa: ', data);
        getReportCard();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const getReportCard = async () => {
    fetch('http://localhost:3001/api/registrations')
      .then(response => response.json())
      .then(data => {
        console.log('getReportCard respuesta exitosa');
        console.log('getReportCard data:', data);
        setRegistrationData(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <h1>Cargar y Analizar CSV</h1>
      <input type="file" accept=".csv" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Enviar documentos</button>
      <button onClick={getReportCard}>Carga reporte</button>
      {registrationData.length === 0 ? <p>No hay datos</p> : <p>Hay datos disponibles</p>}

      <div>
        <h2>Report Card:</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Group</th>
              <th>GA</th>
              <th>AA</th>
              <th>EV</th>
              <th>Code</th>
              <th>Contexto del Evento</th>
              <th>ID User</th>
              <th>User Name</th>
              <th>ID User Affected</th>
              <th>Affected User Name</th>
              <th>Substate</th>
            </tr>
          </thead>
          <tbody>
            {registrationData.length > 0 && registrationData.map((row, index) => (
              <tr key={index}>
                <td>{row.id}</td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>{row.group}</td>
                <td>{row.ga}</td>
                <td>{row.aa}</td>
                <td>{row.ev}</td>
                <td>{row.code}</td>
                <td>{row.contextodelevento}</td>
                <td>{row.idUser}</td>
                <td>{row.userName}</td>
                <td>{row.idUserAfected}</td>
                <td>{row.affectedUserName}</td>
                <td>{row.substate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default App;
