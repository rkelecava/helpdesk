var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
	requestText: String,
	requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	priority: { type: String, default: 'low' },
	requestedDate: { type: Date, default: Date.now },
	assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	resolved: String,
	resolutionNotes: String,
	resolvedDate: Date,
	status: {type: String, default: 'open'}
});

/* Create new Request model using the RequestSchema we just created above */
mongoose.model('Request', RequestSchema);