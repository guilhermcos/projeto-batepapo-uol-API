import Joi from "joi";

const schemaPostParticipants = Joi.object({
    name: Joi.string().min(1).required()
})


const schemas = {
    schemaPostParticipants
};
export default schemas