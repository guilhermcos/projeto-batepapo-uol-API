import Joi from "joi";

const schemaPostParticipants = Joi.object({
    name: Joi.string().min(1).required()
})

const schemaPostMessagesBody = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required(),
    type: Joi.string().valid("message", "private_message").required()
})

const schemaPostMessagesHeader = Joi.object({
    user: Joi.string().min(1).required()
}).unknown(true);

const schemaGetMessagesHeader = Joi.object({
    user: Joi.string().min(1).required()
}).unknown(true);

const schemaGetMessagesQuery = Joi.object({
    limit: Joi.number().integer().min(1)
}).unknown(true);

const schemaPostStatus = Joi.object({
    user: Joi.string().min(1).required()
}).unknown(true);

const schemaTrim = Joi.string().trim();

const schemas = {
    schemaPostParticipants,
    schemaPostMessagesBody,
    schemaPostMessagesHeader,
    schemaGetMessagesQuery,
    schemaGetMessagesHeader,
    schemaPostStatus,
    schemaTrim
};
export default schemas