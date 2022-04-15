var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
    clients:{},
reset: function(){this.clients={}},

addAppointment: function(name,date){
    if(!name){ //si no recibo el nombre del cliente
        throw new Error('the body must have a client property');
    } 
    if(typeof name !== 'string') { //si ese nombre no es un string
        throw new Error("client must be a string");
    }
    if(this.clients[name]) { //si el cliente ya existe, le agregamos la cita
        this.clients[name].push({date: date.date, status: 'pending'});
        //return this.clients[name];
    }else{
        this.clients[name] = [{date: date.date, status: 'pending' }]; //si no existe, lo creamos
    }
    return this.clients[name];
   /*  if(!this.clients[name]) { // Si no existe el cliente, creal
        this.clients[name] = [{date: date.date, status: 'pending' }];
        return this.clients[name];
    } */
},
attend : function (name, date) { 
    if (this.clients[name] ) {
        let filterDate = this.clients[name].filter(d => d.date === date);
        filterDate[0].status = 'attended';
    }
},
expire: function(name,date){
    if (this.clients[name] ) {
        let filterDate = this.clients[name].filter(d => d.date === date);
        filterDate[0].status = 'expired';
    }
},
cancel:function(name,date){
    if (this.clients[name] ) {
        let filterDate = this.clients[name].filter(d => d.date === date);
        filterDate[0].status = 'cancelled';
    }
},
erase: function(name,argument){
    if(argument === "attended" || argument === "cancelled" || argument === "expired") {
        let filterDelete = [...this.clients[name]];
        this.clients[name] = this.clients[name].filter(d => d.status !== argument);
        
        filterDelete = filterDelete.filter(d => d.status === argument); 
        return filterDelete;
    }                       
    this.clients[name] = this.clients[name].filter(d => d.date !== argument);       
},
getAppointments: function(name,status){
    if (name && status) {
        let filterStatus = this.clients[name].filter(s => s.status === status);
        return filterStatus;
    }
    if(name && !status && this.clients[name]) return this.clients[name];
    return this.clients;
},
getClients: function(name,date,option){
    if (!name && !date && !option) {
        // console.log(Object.getOwnPropertyNames(this.clients), 'está entrando acá!')
        return Object.getOwnPropertyNames(this.clients);
    }

    if (name && !date && !option) { // Me llega solo name
        if(!this.clients[name]) throw new Error ('the client does not exist'); // Si no lo encuentro
        return this.clients[name];
    }

    if (name && date && !option) {
        if(!this.clients[name]) throw new Error ('the client does not exist'); // Si no lo encuentro
        return model.erase(name, date);
    }
    if (name && date && option) { // Me llegan los tres
        if(option === "attend" || option === "expire" || option === "cancel" ) {
            
            if(!this.clients.hasOwnProperty(name)) { // Si no encuentro name
                throw new Error ('the client does not exist');
            }      
            
            if(this.clients.hasOwnProperty(name)) {
                let filterResul =  this.clients[name].filter(f => f.date === date);
                if (filterResul.length === 0 ) { // Si no encuentro la búsqueda
                    throw new Error ('the client does not have a appointment for that date');
                }
                
                if(option === "attend") return model.attend (name, date);
                if(option === "expire") return model.expire (name, date);
                if(option === "cancel") return model.cancel (name, date);
                if (filterResul.length > 0 ) { // Si encuentro algo
                    return filterResul;                        
                }                    
            }             
        } else {
            throw new Error ('the option must be attend, expire or cancel');
        }           
    }
}
};
server.use(bodyParser.json());

server.get('/api', (req,res)=>{
    res.json(model.getAppointments())
});
server.post('/api/Appointments', async (req,res)=>{
    let { client,appointment } = req.body
    try{
        let resul = await model.addAppointment(client, appointment);
        res.json(resul[0]);
    }catch(err){
        res.status(400).send(err.message);
    }
});
server.get('/api/Appointments/clients',  async (req, res) => {
    try {
        let resul = await model.getClients();
        res.json(resul);
    } catch (err) {
        // console.log('error!')
    }    
});
server.get('/api/Appointments/getAppointments/:name', async (req, res) => {
    const { name } = req.params;
    let resul2 = await model.getClients(name);
    res.json(resul2);
   // res.json(filterDate);
    
});
server.get('/api/Appointments/:name/erase', async (req, res) => {
    const { name } = req.params;
    const { date } = req.query;

    try {
        let resul3 = await model.getClients(name, date); 
        res.json(resul3);
    } catch (err) {
        res.status(400).send(err.message);
    }
});
server.get('/api/Appointments/:name', async (req, res) => { 
    let { name } = req.params;
    let { date, option} = req.query;
    try {
        let resul = await model.getClients( name, date, option );
        res.json(resul);
    } catch (err) {
        res.status(400).send(err.message);
    }
});



server.listen(3000);
module.exports = { model, server };
