import cassandra from 'cassandra-driver';

const cassandraClient = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_HOTNAME],
  localDataCenter: 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE
});

await cassandraClient.connect()

export { cassandraClient };