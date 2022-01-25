const {v4} = require('uuid');
const AWS = require('aws-sdk');

let options = {}
if(process.env.IS_OFFLINE){
    options={
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    }
}

const dynamodb = new AWS.DynamoDB.DocumentClient(options);

const addHorarios = async(event)=>{

    try{
        
        const {horarios} = JSON.parse(event.body)

                        
        let newHorario
        let id 
        for(const horarioElem of horarios){
        
             id = v4()
             
            newHorario = {
                id,
               'horario': horarioElem.horario,
                'fecha': horarioElem.fecha,
                'capacidadMaxima': horarioElem.capacidadMaxima,
                'disponibilidad': horarioElem.disponibilidad
            }
    
            await dynamodb.put({
                TableName: 'HorariosTable',
                Item: newHorario
            }).promise()
        }
        
    
        
    
        return {
            status:200,
            body: "Done!"
        }
    }catch(error){
        console.log(error)
    }
    
}


const getHorarios = async(event)=>{
    try {
        
        const result = await dynamodb.scan({
             TableName: 'HorariosTable'        
         }).promise()
     
     const horarios = result.Items
         return {
             status:200,
             body:  {horarios}
         }     
    } catch (error) {
        console.log(error)
    }

   
}

module.exports={
    addHorarios,
    getHorarios
}