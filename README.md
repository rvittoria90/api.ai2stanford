# api.ai2stanford
Small utilities to convert an agent built in Api.ai into a traningset for Stanford Core NLP

input: intents in .json from api.ai (ie. your dataset)

input: entities in .json form api.ai (to convert into gazettes, i.e. your vocabulary)

output: traindset for stanford NER in .tsv

output: gazzettes for stanford NER in .gaz


Unzip an agent from Api.ai into the folder "Agent"
Before running the conversion you need to fit the files "Entity2Alias.json" and "ignoresubstituion.json" on your agent design.
