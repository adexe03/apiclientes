const HOST = 'http://localhost:3000/api/';
const tbody = document.querySelector('tbody');
const fieldID = document.getElementById('id');
const fieldNAME = document.getElementById('nombre');
const fieldLASTNAME = document.getElementById('apellidos');
const fieldLOCATION = document.getElementById('localidad');

function loadClients() {
  fetch(HOST + 'clientes')
    .then(res => res.json())
    .then(json => {
      let clientes = json.data.clientes;
      // Rellenar la tabla de clientes.
      tbody.innerHTML = '';
      clientes.forEach(client => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${client.id}</td>
          <td>${client.nombre}</td>
          <td>${client.apellidos}</td>
          <td>${client.localidad}</td>
          <td>
            <img src='img/editar.png' onclick="loadClient(${client.id})">
            <img src='img/eliminar.png' onclick="removeClient(${client.id})">

          </td>
        `;
        tbody.append(tr);
      });
    });
  tbody.innerHTML = "<tr><td colspan=\"5\">Cargando datos...</td></tr>";
}

function loadClient(id) {
  fetch(HOST + 'clientes/' + id)
    .then(res => res.json())
    .then(json => {
      fieldID.value = json.data.id;
      fieldNAME.value = json.data.nombre;
      fieldLASTNAME.value = json.data.apellidos;
      fieldLOCATION.value = json.data.direccion.localidad;
    });
}

function removeClient(id) {
  console.log('eliminando', id);
  let requestOptions = {
    method: "DELETE"
  };
  fetch(HOST + 'clientes/' + id, requestOptions)
    .then(res => res.json())
    .then(json => {
      console.log(json);
      loadClients();
    })
}

function createClient() {
  let name = fieldNAME.value;
  let lastName = fieldLASTNAME.value;
  let location = fieldLOCATION.value;
  let client = {
    "nombre": name,
    "apellidos": lastName,
    "direccion": {
      "localidad": location
    }
  };

  let requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(client)
  };

  fetch(HOST + 'clientes/', requestOptions)
    .then(res => res.json())
    // No haría falta
    .then(json => {
      console.log(json);
      loadClients();
    });
}

function editClient() {
  let id = fieldID.value;
  console.log('Modificando...');
  let client = {
    nombre: fieldNAME.value,
    apellidos: fieldLASTNAME.value,
    direccion: {
      localidad: fieldLOCATION.value
    }
  };

  let requestOptions = {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(client)
  }

  fetch(HOST + 'clientes/' + id, requestOptions)
    .then(res => res.json())
    // No haría falta
    .then(json => {
      console.log(json);
      loadClients();
    });
}

loadClients();