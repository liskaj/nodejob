set MONGOD=C:\Tools\mongodb-win32-x86_64-2008plus-2.4.3\bin\mongod

start %MONGOD% --rest --dbpath .\db
pause

start node server.js
pause

start node jobhandler.js