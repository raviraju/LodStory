package edu.isi.serverbackend.request;

import edu.isi.serverbackend.linkedData.*;
import edu.isi.serverbackend.localDatabase.bean.PredicateBean;
import edu.isi.serverbackend.feature.util.*;

import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;
import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.*;
import org.json.*;

import javax.servlet.ServletContext;

public class TripleRankRequest {
	private LinkedDataNode currentNode;
	private List<Sample> samples;
	String ratingResponse = "";
    SentenceHashUtil sentenceHashUtil;
    ServletContext context;
	//private RepositoryConnection repoConnection;
	
	public TripleRankRequest(LinkedDataNode currentNode, ServletContext context) throws IOException{
        this.context = context;
        this.sentenceHashUtil = new SentenceHashUtil();
		this.currentNode = currentNode;
		//this.repoConnection = currentNode.getRepoConnection();
		this.samples = new ArrayList<Sample>();
		
		
		try {
			retrieveObjectExtensions();
			retrieveSubjectExtensions();
			
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedQueryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (QueryEvaluationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} /*catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}*/
		
	}
	
	public TripleRankRequest(LinkedDataNode currentNode) throws IOException{
        this.sentenceHashUtil = new SentenceHashUtil();
		this.currentNode = currentNode;
		//this.repoConnection = currentNode.getRepoConnection();
		this.samples = new ArrayList<Sample>();
		
		
		try {
			retrieveObjectExtensions();
			retrieveSubjectExtensions();
			
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedQueryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (QueryEvaluationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} /*catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}*/
		
	}
	
	public void retrieveObjectExtensions() throws RepositoryException, MalformedQueryException, QueryEvaluationException{
		System.out.println("TripleRankRequest::retrieveObjectExtensions for "+ currentNode.getName());
		currentNode.retrieveObjectExtensions(samples, false);
	}
	
	public void retrieveSubjectExtensions() throws RepositoryException, MalformedQueryException, QueryEvaluationException{
		System.out.println("TripleRankRequest::retrieveSubjectExtensions for "+ currentNode.getName());
		currentNode.retrieveSubjectExtensions(samples, false);
	}
	
	public void rateInterestingness()throws IOException{
		System.out.println("TripleRankRequest::rateInterestingness");
        //store relationship, weight and subject/weight
        Map<String,Double> relationshipMap = new HashMap<String,Double>();
        Map<String,Double> subjectMap = new HashMap<String,Double>();
             
		String password;
		//Read the SQL password from a file
		BufferedReader reader = null;
		try{
			InputStream inputStream = getClass().getClassLoader().getResourceAsStream("SQLpw.txt");
			reader = new BufferedReader(new InputStreamReader(inputStream));
			password = reader.readLine();
		}
		catch (NullPointerException e){
			e.getStackTrace();
			password = "";
		}
        try{
	        // create a mysql database connection
			String myDriver = "com.mysql.jdbc.Driver";
			String myUrl = "jdbc:mysql://localhost/lodstories";
			Class.forName(myDriver);			
			Connection connection = DriverManager.getConnection(myUrl, "root", password);
	
			Statement statement = connection.createStatement();  
		    statement.setQueryTimeout(30);  // set timeout to 30 sec.
		    
		    System.out.println("\t Executing : " + "SELECT predicate, appearances, chosen FROM path_explorer");
		    ResultSet rs = statement.executeQuery("SELECT predicate, appearances, chosen FROM path_explorer");			  
			while(rs.next()){
				String predicate = rs.getString("predicate");
				int appearances = rs.getInt("appearances");				
				int chosen = rs.getInt("chosen");
				double weight = chosen/appearances;
				
				double existingWeight = 0;
				if(relationshipMap.containsKey(predicate)){
					existingWeight = relationshipMap.get(predicate);								
					relationshipMap.put(predicate, existingWeight + weight);
				}else{
					relationshipMap.put(predicate, weight);
				}
			}
			
			System.out.println("\t Executing : " + "SELECT subject, appearances, chosen FROM path_explorer");
		    rs = statement.executeQuery("SELECT subject, appearances, chosen FROM path_explorer");			  
			while(rs.next()){
				String subject = rs.getString("subject");
				int appearances = rs.getInt("appearances");				
				int chosen = rs.getInt("chosen");
				double weight = chosen/appearances;
				
				double existingWeight = 0;
				if(subjectMap.containsKey(subject)){
					existingWeight = subjectMap.get(subject);				
					subjectMap.put(subject, existingWeight + weight);
				}else{
					subjectMap.put(subject, weight);
				}
			}
		    
		} catch (Exception e) {
			e.printStackTrace();
		}
        System.out.println("Load Relationship Map");
        for (String key : relationshipMap.keySet()) {
            System.out.println("\t Key: " + key + ", Value: " + relationshipMap.get(key));
        }
        System.out.println("Load Subject Map");
        for (String key : subjectMap.keySet()) {
            System.out.println("\t Key: " + key + ", Value: " + subjectMap.get(key));
        }

        for(int i = 0 ; i < samples.size(); i++){

            double factor1, factor2;
            factor1 = 0;
            factor2 = 0;

            //process predicate from url to single word
            String urlPredicate = samples.get(i).getLink().getPredicate();
            String[] predicateArr = urlPredicate.split("/");
            String predicate = predicateArr[predicateArr.length -1];
           
            
            if( relationshipMap.containsKey(predicate) ){            	
                factor1 = relationshipMap.get(predicate);
                //System.out.println("\t predicate string : " + predicate);
                //System.out.println("\t predicate factor f1: " + factor1);
            }
            //check sample
            if(samples.get(i).getLink().isSubjectConnection()){
                if( subjectMap.containsKey(samples.get(i).getLink().getObject().getURI())){
                    factor2 = subjectMap.get(samples.get(i).getLink().getObject().getURI());
                    //System.out.println("\t subject connection f2: " + factor2);
                }
            }
            else if(!samples.get(i).getLink().isSubjectConnection()){
                if( subjectMap.containsKey(samples.get(i).getLink().getSubject().getURI())){
                    factor2 = subjectMap.get(samples.get(i).getLink().getSubject().getURI());
                    //System.out.println("\t object connection f2: " + factor2);
                }
            }
            //set interestness
            samples.get(i).setInterestingness(factor1 * factor2);
            if(factor1 != 0 && factor2 != 0){
            	System.out.println("\t ******************************************");
                System.out.println("\t s: " + samples.get(i).getLink().getSubject().getURI() + 
                				   "\t p: " + samples.get(i).getLink().getPredicate() +
                				   "\t o: " + samples.get(i).getLink().getObject().getURI());
            	
            	System.out.println("\t Interestingness: " + samples.get(i).getInterestingness());
            }
        }
    }
	
	public void sortConnections(){
		System.out.println("TripleRankRequest::sortConnections");
		//algorithm: bubble sort // note from Dipa: WHY????
		boolean swap = true;
		Sample temp = null;
		
		while(swap){
			swap = false;
			for(int i = 0;i < samples.size()-1;i++){
				if(samples.get(i).getInterestingness() < samples.get(i+1).getInterestingness()){
					temp = samples.get(i+1);
					samples.set(i+1, samples.get(i));
					samples.set(i, temp);
					swap = true;
				}
			}
		}
        
		System.out.println("No of samples : " + samples.size());
        System.out.println("after ranking top 7 samples:");
        int index_limit = 0;
		for(int i=0;i<samples.size();i++){
            if( samples.get(i).getLink().isSubjectConnection()){
                System.out.println("\t Interestingness: " + samples.get(i).getInterestingness() + "\t " + samples.get(i).getLink().getObject().getURI());
            }
            else{
                System.out.println("\t Interestingness: " + samples.get(i).getInterestingness() + "\t " + samples.get(i).getLink().getSubject().getURI());
            }
			index_limit += 1;
			if(index_limit > 6){
				break;
			}

        }

        //remove some nodes
         for(int i = 0; i < samples.size(); i++){
	        if(samples.get(i).getLink().getPredicate().equals("http://dbpedia.org/ontology/wikiPageRedirects")
							|| samples.get(i).getLink().getPredicate().equals("http://dbpedia.org/ontology/wikiPageDisambiguates")
							|| samples.get(i).getLink().getPredicate().equals("http://dbpedia.org/ontology/wikiPageExternalLink")){
						samples.remove(i);
						i--;
					}	
		}
         System.out.println("After remove nodes whose predicates are wikiPageRedirects, wikiPageDisambiguates, wikiPageExternalLink");
         System.out.println("No of samples : " + samples.size());
         
         
        //delete some nodes so that the same relationsship will not be displayed
        HashSet<String> relationSet = new HashSet<String>();
		relationSet.clear();
		int counter = 0;//make sure not removing to many nodes
        for(int i = 0; i < samples.size(); i++){
			if(!relationSet.contains(samples.get(i).getLink().getPredicate())){
				relationSet.add(samples.get(i).getLink().getPredicate());
				counter++;
			}
			else{
				samples.remove(i);//remove sample with duplicate predicates
				i--;
			}
			if(counter >= 5){
				break;
			}
		}
        System.out.println("After removing samples whose predicates are duplicates");
        System.out.println("No of samples : " + samples.size());
        
        if(samples.size() > 7){

        	//rank top 5 and randomly pick two
	        int index = 0; // the first one with interestness of 0
	        for(int i=0;i<samples.size();i++){
	        	if(samples.get(i).getInterestingness() == 0){
	        		index = i;
	        		break;
	        	}
	        }
	        
	        //make sure index >= 5, or the first node may be swapped 
	        index = Math.max(5,index);


	   		 int randomNum1 = index + (int)(Math.random() * (samples.size() - index));
	   		 int randomNum2 = index + (int)(Math.random() * (samples.size() - index));
	   		//make sure two random numbers are not equal
	   		 while(randomNum2 == randomNum1){
	   		 	randomNum2 = index + (int)(Math.random() * (samples.size() - index));
	   		 }
	   		 //swap sample at index 5 with randomNum1's sample
	   		 temp = samples.get(5);
	   		 samples.set(5, samples.get(randomNum1));
	   		 samples.set(randomNum1, temp);
	   		 //swap sample at index 6 with randomNum2's sample
	   		 temp = samples.get(6);
	   		 samples.set(6, samples.get(randomNum2));
	   		 samples.set(randomNum2, temp);
		}
   		

		eliminateSameNodeExtension();
		System.out.println("After eliminateSameNodeExtension");
        System.out.println("No of samples : " + samples.size());
	}
	
	/*Precondition: Sample is sorted*/
	private void eliminateSameNodeExtension(){
		HashSet<String> nodeSet = new HashSet<String>();
		int i = 0;
		while(i < samples.size()){
			String target;
			if(samples.get(i).getLink().isSubjectConnection())
				target= samples.get(i).getLink().getObject().getURI();
			else
				target = samples.get(i).getLink().getSubject().getURI();
			if(nodeSet.contains(target)){
				samples.remove(i);
				continue;
			}
			else{
				nodeSet.add(target);
				i++;
			}
				
		}
	}
	
	
	public JSONObject exportD3JSON(int num) throws JSONException{
		JSONObject result = new JSONObject();
		JSONArray childrenArray = new JSONArray();
		//List<Sample> orderedSamples = reorderByRelation(num);
		//delete the logic of reorderbyrelation
		List<Sample> orderedSamples = samples;
		for(int i = 0; i < num; i++){
			if(i >= orderedSamples.size())
				break;
			JSONObject newNode = new JSONObject();

            String subject = orderedSamples.get(i).getLink().getSubject().getName();
            String object = orderedSamples.get(i).getLink().getObject().getName();
            String relation = PredicateBean.obtainPredicateName(orderedSamples.get(i).getLink().getPredicate());
			if(orderedSamples.get(i).getLink().isSubjectConnection()){
				newNode.put("name", object);
				newNode.put("uri", orderedSamples.get(i).getLink().getObject().getURI());
				newNode.put("relationship", relation);
				newNode.put("inverse", 0);
				newNode.put("rank", orderedSamples.get(i).getInterestingness());
                newNode.put("image", orderedSamples.get(i).getLink().getObject().getImage());
                newNode.put("relation", SentenceHashUtil.parseSentence(relation, 0, orderedSamples.get(i).getLink().getObject().getTypeURI()));
			}
			else{
				newNode.put("name", subject);
				newNode.put("uri", orderedSamples.get(i).getLink().getSubject().getURI());
				newNode.put("relationship", relation);
				newNode.put("inverse", 1);
				newNode.put("rank", orderedSamples.get(i).getInterestingness());
                newNode.put("image", orderedSamples.get(i).getLink().getSubject().getImage());
                newNode.put("relation", SentenceHashUtil.parseSentence(relation, 1, orderedSamples.get(i).getLink().getSubject().getTypeURI()));
			}
			childrenArray.put(newNode);
		}
	
		result.put("name", currentNode.getName());
		result.put("uri", currentNode.getURI());
		result.put("relation", "none");
		result.put("children", childrenArray);
		//result.put("resultLine", ratingResponse);
		result.put("Size", orderedSamples.size());
		return result;
	}
	
	public List<Sample> getSamples(){
		return this.samples;
	}
	
	public int getNumbetConnections(){
		return samples.size();
	}
	
	private List<Sample> reorderByRelation(int num){
		List<Sample> result = new ArrayList<Sample>();
		int count = 0;
		HashSet<String> relationSet = new HashSet<String>();
		while (count < num && samples.size() > 0){
			relationSet.clear();
			for(int i = 0; i < samples.size(); i++){
				if(!relationSet.contains(samples.get(i).getLink().getPredicate())){
					if(samples.get(i).getLink().getPredicate().equals("http://dbpedia.org/ontology/wikiPageRedirects")
							|| samples.get(i).getLink().getPredicate().equals("http://dbpedia.org/ontology/wikiPageDisambiguates")
							|| samples.get(i).getLink().getPredicate().equals("http://dbpedia.org/ontology/wikiPageExternalLink")){
						samples.remove(i);
						continue;
					}	
					relationSet.add(samples.get(i).getLink().getPredicate());
					result.add(samples.get(i));
					samples.remove(i);
					count++;
					if(count == num)
						return result;
				}
			}
		}
		return result;
	}
}
