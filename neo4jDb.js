const neo4j = require('neo4j-driver');
require('dotenv').config();

async function createPostRelation(req,res)
{
  const{userName,text} = req.body;
  const date = new Date();
  const id = userName + date.getHours() + date.getMinutes() + date.getSeconds();
  const driver =  neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();
  const data = {
    id:id,
    userName: userName,
    text: text,
    DateAndTime:date.toString()
  };

  const cypherQuery = 'CREATE (p:Post {userName: $userName , text: $text , DateAndTime:$DateAndTime , id:$id}) RETURN p';

  console.log("this is console under neo4j");
  session.run(cypherQuery, data)
  .then(result => {
    console.log('Post created successfully');
  })
  .catch(error => {
    console.error('Error creating post:', error);
  })
  .finally(() => {
    // Close the session when finished
    session.close();
    // Close the driver when finished
    driver.close();
    res.send("node created successfully");
  });
}


async function getPost(req,res)
{

  const driver =  neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();

  const cypherQuery = 'MATCH (p:Post) RETURN p';

  console.log("this is console under neo4j");


  try {
    const result = await session.run(cypherQuery);
    const nodes = result.records.map(record => record.get('p').properties);
    console.log('Nodes fetched successfully:', nodes);
    res.send(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
  } finally {
    session.close();
    driver.close();
    
  }
}



async function createLikeRelation(req, res) {

  const { userName, id } = req.body;
  const driver =  neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();

  try {
    await session.writeTransaction(async (transaction) => {
      const data = {
        id: id,
        userName: userName,
      };

      const cypherQuery = 'CREATE (l:like {userName: $userName , id:$id}) RETURN l';
      await transaction.run(cypherQuery, data);

      const likedPost = 'MATCH (p:Post {id: $id}) RETURN p';
      const like = 'MATCH (l:like {id: $id}) RETURN l';

      const nodeResult = await transaction.run(likedPost, { id });
      const node = nodeResult.records[0].get('p');

      const relatedNodeResult = await transaction.run(like, { id });
      const relatedNode = relatedNodeResult.records[0].get('l');

      // Create a relationship between the two nodes
      const createRelationQuery = 'MATCH (p:Post {id: $id}), (l:like {id: $id}) CREATE (p)-[:Liked]->(l)';
      await transaction.run(createRelationQuery, { id, id });

      console.log('Relationship created successfully');
      res.send(relatedNode);
    });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).send('Error creating relationship');
  } finally {
    session.close();
    driver.close();
  }

}

async function deleteNodes(req,res)
{
  const driver =  neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();

  const cypherQuery = 'MATCH (p:Person) DETACH DELETE p';

  console.log("this is console under neo4j");


  try {
    const result = await session.run(cypherQuery);
    res.send("nodes deleted");
  } catch (error) {
    console.error('Error fetching nodes:', error);
  } finally {
    session.close();
    driver.close();
    
  }
}

async function createComments(req,res)
{
  const { userName, id,text } = req.body;
  const date = new Date();
  const driver =  neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();

  try {
    await session.writeTransaction(async (transaction) => {
      const data = {
        id: id,
        userName: userName,
        text:text,
        DateAndTime:date.toString()
      };

      const cypherQuery = 'CREATE (c:comment {userName: $userName , id:$id , text:$text , DateAndTime:$DateAndTime}) RETURN c';
      await transaction.run(cypherQuery, data);

      const commentedPost = 'MATCH (p:Post {id: $id}) RETURN p';
      const comment = 'MATCH (c:comment {id: $id}) RETURN c';

      const nodeResult = await transaction.run(commentedPost, { id });
      const node = nodeResult.records[0].get('p');

      const relatedNodeResult = await transaction.run(comment, { id });
      const relatedNode = relatedNodeResult.records[0].get('c');

      // Create a relationship between the two nodes
      const createRelationQuery = 'MATCH (p:Post {id: $id}), (c:comment {id: $id}) CREATE (p)-[:Commented]->(c)';
      await transaction.run(createRelationQuery, { id, id });

      console.log('Relationship created successfully');
      res.send(relatedNode);
    });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).send('Error creating relationship');
  } finally {
    session.close();
    driver.close();
  }
}

async function getAllComments(req,res)
{
  const driver =  neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();

  const cypherQuery = 'MATCH (c:comment) RETURN c';

  console.log("this is console under neo4j");


  try {
    const result = await session.run(cypherQuery);
    const nodes = result.records.map(record => record.get('c').properties);
    console.log('Nodes fetched successfully:', nodes);
    res.send(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
  } finally {
    session.close();
    driver.close();
    
  } 
}
// async function createFollowers(req,res)
// {

// }
// MATCH (a:Person {name: 'Alice'}), (b:City {name: 'London'})
// CREATE (a)-[:LIVES_IN]->(b)
// RETURN a, b

module.exports = {createPostRelation,getPost,createLikeRelation,deleteNodes,createComments,getAllComments};
