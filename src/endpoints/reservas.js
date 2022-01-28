const AWS = require('aws-sdk');
const {v4} = require ('uuid');

const Responses = require('../common/API_Responses');

let options = {}
if(process.env.IS_OFFLINE){
    options={
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    }
}

const dynamodb = new AWS.DynamoDB.DocumentClient(options);


const addReserva = async(event)=>{
    try {

    const {fecha,horario,idHorario,titularReserva,adicionalesReserva} = JSON.parse(event.body)

    
     // check time availability    

     const result = await dynamodb.get({
         TableName: 'HorariosTable',
         Key:{
             id: idHorario
         }
     }).promise()

     const horarioResult  = result.Item
     
     const totalReservas = titularReserva.length + adicionalesReserva.length
    
     let dataResponse={}

     if(totalReservas <= horarioResult.disponibilidad){
        console.log('se puede', totalReservas,horarioResult.disponibilidad)
        // 1- actualizo la disponibilidad
        await dynamodb.update({
            TableName: 'HorariosTable',
            Key: { id:idHorario },
            UpdateExpression: 'set disponibilidad= :disponibilidad',
            ExpressionAttributeValues : { ':disponibilidad': horarioResult.disponibilidad-totalReservas }
            
        }).promise()

        // 2- almaceno la reserva
        const id = v4();
        const newReserva={id,fecha,horario,idHorario,titularReserva,adicionalesReserva};

        await dynamodb.put({
            TableName:'ReservasTable',
            Item: newReserva
        }).promise()

        dataResponse = {message: 'Done!', reservaId:id}
        return Responses._200(dataResponse);

     }else{      
        dataResponse = {message: 'Lo sentimos pero la reserva no pudo ser realizada. Localidades disponibles actualizadas. Por favor chequee la disponibilidad del horario!'}
        return Responses._400(dataResponse);
     }


     
        
    } catch (error) {
        return Responses._400({error});        
    }
}

const getReservas = async(event)=>{
    try {
        
        const result = await dynamodb.scan({
             TableName: 'ReservasTable'        
         }).promise()
     
     const reservas = result.Items
         return Responses._200({reservas})
               
    } catch (error) {
        return Responses._400({error});        
    }
}

const getReserva = async(event)=>{
    try {
        
        const {id} =event.pathParameters;
        console.log(id)

        const result = await dynamodb.get({
             TableName: 'ReservasTable',
             Key:{
                id
             }       
         }).promise()
     
     const reserva = result.Item
     return Responses._200({reserva})    
    } catch (error) {
        return Responses._400({error}); 
    }
}

module.exports = {addReserva,getReservas,getReserva}