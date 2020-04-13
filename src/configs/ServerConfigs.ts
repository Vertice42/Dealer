export default {
    Port: (7777 || process.env.Port),
    URL: ('http://localhost:' || process.env.HOST) + (7777 || process.env.Port)
    
}