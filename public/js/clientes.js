const HOST = 'http://localhost:3000/api/';
const tbody = document.querySelector('tbody');

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
          <td></td>
        `;
        tbody.append(tr);
      });
    });
  tbody.innerHTML = "<tr><td colspan=\"5\">Cargando datos...</td></tr>";
}

loadClients();