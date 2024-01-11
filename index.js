let express = require('express');
let morgan = require('morgan');
let cors = require('cors');
let app = express();

const PARAMETROS_CONSULTABLES=["vip","nombre","apellidos","localidad", "idioma", "fecha-desde","fecha-hasta","preferencia"];
const PORT = process.env.PORT || 3000;
const CLIENTES = require('./clientes');
let idNuevo = CLIENTES.length;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + '/public'));

app.get('/', (req,res)=>{
    res.send("hola mundo!");
});

app.get('/api/clientes', (req,res)=>{
    let consultas = req.query;
    let claves = Object.keys(consultas);
    let codigo_error = 0;  // No hay error.
    let mensaje_error="";
    let claves_erroneas = [];
    claves.forEach(clave=>{
        if (!PARAMETROS_CONSULTABLES.includes(clave)) claves_erroneas.push(clave);
    });

    if (claves_erroneas.length) {
        mensaje_error +=  "Los siguientes campos de consulta no son correctos: "+claves_erroneas
    } else {
        // Comprobamos vip es true,
        if (consultas.vip && !esBoolean(consultas.vip)) {
            mensaje_error += 'El campo de consulta "vip" debe ser true o false. ';
        }
        // Comprobamos de si fecha-desde y fecha-hasta son fechas válidas.
        if (consultas["fecha-desde"] && !esFechaValida(consultas["fecha-desde"])) {
            mensaje_error += 'El campo de consulta "fecha-desde" debe ser una fecha válida. ';
        }
        if (consultas["fecha-hasta"] && !esFechaValida(consultas["fecha-hasta"])) {
            mensaje_error += 'El campo de consulta "fecha-hasta" debe ser una fecha válida. ';
        }
    }
    if (mensaje_error) {
        codigo_error=400
        res.status(400).json({
            success: false,
            error_code: codigo_error,
            message: mensaje_error
        });
    } else {
        let clientesFiltro = CLIENTES.filter(cliente=>{
            // vamos comprobrando los filtros y cuando haya uno que no cumple devolvemos false.

            if (consultas.nombre && cliente.nombre) {
                if (!cliente.nombre.toLowerCase().includes(consultas.nombre.toLowerCase())) return false;
            }
            if (consultas.apellidos && cliente.apellidos) {
                if (!cliente.apellidos.toLowerCase().includes(consultas.apellidos.toLowerCase())) return false;
            }
            if (cliente.direccion) {
                if (consultas.localidad && cliente.direccion.localidad) {
                    if (cliente.direccion.localidad.toLowerCase()!=consultas.localidad.toLowerCase()) return false;
                }
            }
            if (cliente.estado) {
                if (consultas.vip && cliente.estado.vip) {
                    if (cliente.estado.vip.toString()!=consultas.vip) return false;
                }
                if (consultas.preferencia && cliente.estado.preferencias) {
                    if (!cliente.estado.preferencias.includes(consultas.preferencia)) return false;
                }
            }
            if (cliente.cuenta) {
                if (consultas.idioma && cliente.cuenta.idioma) {
                    if (cliente.cuenta.idioma.toLowerCase()!=consultas.idioma.toLowerCase()) return false;
                }
            }
            if (cliente.fecha_nacimiento) {
                if (consultas["fecha-desde"]) {
                    let fechaDesde=Date.parse(consultas["fecha-desde"]);
                    let fecha=Date.parse(cliente.fecha_nacimiento);
                    if (fechaDesde>fecha) return false;
                }
                if (consultas["fecha-hasta"]) {
                    let fechaHasta=Date.parse(consultas["fecha-hasta"]);
                    let fecha=Date.parse(cliente.fecha_nacimiento);
                    if (fechaHasta<fecha) return false;
                }    
            }
            return true;
        });
        let clientes_propiedades = clientesFiltro.map(cliente=>{
            return {
                id: cliente.id,
                nombre: cliente.nombre,
                apellidos: cliente.apellidos,
                localidad: cliente.direccion.localidad
            }
        })
        res.json({
            success: true,
            message: "Listado de clientes",
            data: {
                count: clientes_propiedades.length,
                clientes: clientes_propiedades
            }
        }); 
    }       
});

app.get('/api/clientes/:id', (req,res)=>{
    let id = req.params.id;
    let filtro = CLIENTES.filter(cliente=>cliente.id==id);
    if (filtro.length>0) {
        res.json({
            success: true,
            message: "Cliente enconctrado con id: "+id,
            data: filtro[0]
        });
    } else {
        res.status(404).json({
            success: false,
            error_code: 4321,
            message: "No se encuentra ningún cliente con el id: "+id
        });
    }
});

app.post('/api/clientes', (req,res)=>{
    let nuevoCliente = req.body;
    // Compruebo si están los datos obligatorios
    if (nuevoCliente.nombre && nuevoCliente.apellidos && nuevoCliente.direccion.localidad) {
        nuevoCliente.id=++idNuevo;
        CLIENTES.push(nuevoCliente);
        res.status(201).json({
            success: true,
            message: "Cliente creado con éxito",
            data: nuevoCliente
        });
    } else {
        res.status(422).json({
            success: false,
            error_code: 5555,
            message: "Falta algún dato.",
            data: nuevoCliente
        });
    }
});

app.put('/api/clientes/:id',(req,res)=>{
    let id = req.params.id;
    let filtro = CLIENTES.filter(cliente=>cliente.id==id);
    if (filtro.length==0) {
        res.status(404).json({
            success: false,
            error_code: 4322,
            message: "No se encuentra el cliente que se quiere modificar con el id: "+id
        });
    } else {
        let nuevosDatos = req.body;
        let viejosDatos = filtro[0];
        MergeRecursive(viejosDatos,nuevosDatos);
        res.json({
            success: true,
            message: "Cliente modificado con éxito",
            data: viejosDatos
        });
    }
});

app.delete('/api/clientes/:id',(req,res)=>{
    let id = req.params.id;
    let indice = CLIENTES.findIndex((cliente)=>cliente.id==id);
    console.log(indice);
    if (indice<0) {
        res.status(404).json({
            success: false,
            error_code: 4323,
            message: "No se encuentra el cliente que se quiere borrar con el id: "+id
        });  
    } else {
        let clienteEliminado=CLIENTES.splice(indice,1);
        res.json({
            success: true,
            message: "Cliente eliminado con éxito",
            data: clienteEliminado
        });
    }
});
     
app.listen(PORT, ()=>{
    console.log("El servidor está escuchando en el puerto "+PORT);
});

function esBoolean(b) {
    return (b=="true" || b=="false");
    return false;
}

function esFechaValida(f) {
    let fecha = Date.parse(f);
    return !isNaN(fecha);
}

function MergeRecursive(obj1, obj2) {
    for (let p in obj2) {
      try {
        // Property in destination object set; update its value.
        if ( obj2[p].constructor==Object ) {
          obj1[p] = MergeRecursive(obj1[p], obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }
      } catch(e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];
      }
    }
    return obj1;
  }