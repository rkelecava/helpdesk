var mongoose = require('mongoose');



/* Create new Request model using the RequestSchema we just created above */
mongoose.model('Request', RequestSchema);