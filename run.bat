set MONGOD="C:\Program Files\mongodb-win32-x86_64-2008plus-2.4.3\bin\mongod.exe"

if not exist .\results md .\results

start "DB Server" %MONGOD% --rest --dbpath .\db
pause

start "App Server" node server.js
pause

start "Job Handler" node jobhandler.js
