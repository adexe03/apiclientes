const URL_BASE = "http://localhost:3000/api/";

const TBODY = document.querySelector('tbody');
const NOMBRE = document.getElementById('nombre');
const APELLIDOS = document.getElementById('apellidos');
const LOCALIDAD = document.getElementById('localidad');
const ID = document.getElementById('id');
const MESSAGE = document.getElementById('message');

loadClients();

function loadClients() {
  TBODY.innerHTML = `
    <tr>
      <td colspan="4">Cargando...</td>
    </tr>
  `
  fetch(URL_BASE + 'clientes')
  .then(res => res.json())
  .catch(err => MESSAGE.innerHTML = "Error de conexión")
  .then(json => {    
    let clientes = json.data.clientes;
    console.log(clientes);
    TBODY.innerHTML = '';
    clientes.forEach(client => {
      let linea = document.createElement('tr');
      linea.innerHTML = `
      <td>${client.id}</td>
      <td>${client.nombre}</td>
      <td>${client.apellidos}</td>
      <td>${client.localidad}</td>
      <td>
        <img src="img/editar.png" alt="editar" onclick="editClient(${client.id})"/>
        <img src="img/eliminar.png" alt="eliminar" onclick="removeClient(${client.id})" />
      </td>
      `;
      TBODY.appendChild(linea);
    });
  });
}

function editClient(id) {
  console.log("editando: ", id);

  fetch(URL_BASE + 'clientes/' + id)
  .then(res => {
    console.log(res);
    if (res.status ="404") {
      MESSAGE.innerHTML = "Usuario no encontrado"
    }
    return res.json();
  })  
  .catch(err => MESSAGE.innerHTML = "Error de conexión")
  .then(json => {
    console.log(json);
    if (json.success) {
      console.log(json);
      let client = json.data;
      NOMBRE.value = client.nombre;
      APELLIDOS.value = client.apellidos;
      LOCALIDAD.value = client.direccion.localidad;
      ID.value = client.id;  
    } else {
//      MESSAGE.innerHTML = "Usuario no encontrado"
    }

  });
}

function removeClient(id) {
  console.log("Borrando: ", id);
  fetch(URL_BASE + 'clientes/' + id, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .catch(err => MESSAGE.innerHTML = "Error de conexión")
  .then(json => {
    if (json.success) {
//      console.log(json);
//      loadClients();
      
    }
  });
}

function crearUsuario() {
  let client = {
    "nombre": NOMBRE.value,
    "apellidos": APELLIDOS.value,
    "direccion": {
        "localidad": LOCALIDAD.value
    }
  };

  fetch(URL_BASE + "clientes", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(client)
  })
  .then(res => res.json())
  .then(json => {
    console.log(json);
    loadClients();
  });
}

function modificarCliente() {
  let client = {};
  if (NOMBRE.value.length) {
    client.nombre = NOMBRE.value;
  }
  if (APELLIDOS.value.length) {
    client.apellidos = APELLIDOS.value;
  }

  if (LOCALIDAD.value.length) {
    client.direccion = {
      localidad: LOCALIDAD.value
    }
  }

  console.log(client);

  fetch(URL_BASE + "clientes/" + ID.value, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(client)
  })
  .then(res => res.json())
  .then(json => {
    console.log(json);
    loadClients();
  });
}