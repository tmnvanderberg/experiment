# Experiment for university of Vienna

This project was set up with https://github.com/bjoluc/jspsych-builder/. 

# build instructions

## system dependencies
- nodejs
- npm

# how to install 
Clone the repo and run 
`npm install`.
## running local test server
```
npm run start
```
## packaging for JATOS 
``` 
npm run jatos
```

## running on JATOS 

First install JATOS https://www.jatos.org/Installation.html. On the JATOS GUI, click New study, type in a name, close. Then go to the rating task directory (originally Babel_Daten/borgesp/semantic-memory-task/experiment) and copy the folder "packaged" to the folder that was just created in the JATOS directory inside the "study_assets_root" folder. Back in the GUI, click Components --> New and type in the path to the index.html file inside the packaged folder. Click Run.  

