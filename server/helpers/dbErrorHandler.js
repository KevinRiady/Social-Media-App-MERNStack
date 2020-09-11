// Purpose: to handle validation errors and other erros that the db 
// may throw when we make queries to it.

// A method that will parse and return the error message 
// associated with the specific validation error or other
// errors that can occur while querying MongoDB using Mongoose

const getErrorMessage = (err) => {
    let message = ''
    if (err.code) {
        switch (err.code) {
            case 11000: 
            case 11001:
                message = getUniqueErrorMessage(err)
                break
            default:
                message = 'Something went wrong'
        }
    } 
        else {
            for (let errName in err.errors) {
                if (err.errors[errName].message)
                message = err.errors[errName].message
            }
        }    
    return message
}

// the unique constraint will throw as error that is different than
// a Mongoose validator violation. It will contain its own error code,
// and this has to be handled uniquely.

const getUniqueErrorMessage = (err) => {
    let output
    try {
        let fieldName = 
        err.message.substring(err.message.lastIndexOf('.$') + 2,
        err.message.lastIndexOf('1'))
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) +
        'already exists'
    } catch (ex) {
        output = 'Unique field already exists'
    }
    return output
}

export default {getErrorMessage}