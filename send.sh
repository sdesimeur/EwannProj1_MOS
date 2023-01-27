#!/bin/bash
curl -v -k --digest --user sam:l8ziv7u1 -F file=@api_hwserver.js -F commit_timeout=60 http://192.168.4.3/upload
curl -v -k --digest --user sam:l8ziv7u1 -F file=@init.js -F commit_timeout=60 http://192.168.4.3/upload
curl -v -k --digest --user sam:l8ziv7u1 -F file=@conf1.json -F commit_timeout=60 http://192.168.4.3/upload
curl -v -k --digest --user sam:l8ziv7u1 -F file=@index.html -F commit_timeout=60 http://192.168.4.3/upload
curl -v -k --digest --user sam:l8ziv7u1 http://192.168.4.3/rpc/SYS.Reboot
