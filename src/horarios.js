const {v4} = require('uuid');
const AWS = require('aws-sdk');



const addHorarios = async(event)=>{

    try{
        const dynamodb = new AWS.DynamoDB.DocumentClient();
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
        const dynamodb = new AWS.DynamoDB.DocumentClient();
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