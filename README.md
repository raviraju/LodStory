[LinkedDataEduApp](http://lodstories.isi.edu/LODStories/html/linkeddataeduapp.html)
================

1. Download pem file from ISI and assign permission : `chmod 400 lodstories.pem`
2. Login using : `ssh -i lodstories.pem root@54.69.252.89`
3. Start Tomcat Server at : /usr/share/apache-tomcat-7.0.56 using script in the bin folder (/usr/share/apache-tomcat-7.0.56/bin)
   Use `sh catalina.sh start/stop` to start or stop the website.
4. The mysql server is located at /var/lib/mysql
   Connect to mysql using the command `mysql -u root -h localhost -p`  (no password for root)
5. Jena Fuseki Triple store server is located at /mnt/storage/jena-fuseki-1.1.1
   TDB files (44GB) are at /mnt/storage/tdb_integrated_dbpedia   
   ```
   # cd /mnt/storage/jena-fuseki-1.1.1
   # sh fuseki-server --loc=/mnt/storage/tdb_integrated_dbpedia/ --port=3030 /integrated_dbpedia
    20:45:24 INFO  TDB dataset: directory=/mnt/storage/tdb_integrated_dbpedia/
    20:45:25 INFO  Running in read-only mode.
    20:45:26 INFO  Dataset path = /integrated_dbpedia
    20:45:26 INFO  Fuseki 1.1.1 2014-10-02T16:36:17+0100
    20:45:26 INFO  Started 2017/01/21 20:45:26 UTC on port 3030
    ```
    Use the link http://lodstories.isi.edu:3030 to access to the Fuseki web interface
