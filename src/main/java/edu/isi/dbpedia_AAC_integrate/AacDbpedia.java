package edu.isi.dbpedia_AAC_integrate;

import java.io.File;
import java.io.FileWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONObject;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.query.ARQ;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.engine.binding.Binding;

class Resource{
	String label, comment, placeOfBirth, desc, abstract_detail;
	public Resource(String label,String comment,String placeOfBirth,String desc,String abstract_detail){
		this.label = label;
		this.comment = comment;
		this.placeOfBirth = placeOfBirth;
		this.desc = desc;
		this.abstract_detail = abstract_detail;
	}
}

public class AacDbpedia {

	public static final String AAC_SPARQL_ENDPOINT = "http://data.americanartcollaborative.org/sparql";
	public static final String DBPEDIA_SPARQL_ENDPOINT = "http://dbpedia.org/sparql";
	public static Map<String,Resource> dbpedia_map=new HashMap<String,Resource>();
	
	public static void addConstituentDetail(String constituent_uri, String dbpedia_uri, String aac_object_results){
		String queryString = String.join(""
				,  "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
				,  " PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
				,  " PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/> "
				,  " SELECT ?object ?title ?description ?image ?museum_uri ?museum_name "
				,  " WHERE { "
				,  " ?object a crm:E22_Man-Made_Object ; "
				,  " 	crm:P108i_was_produced_by ?production_event . "
				,  " ?production_event a crm:E12_Production ; "
				,  " crm:P14_carried_out_by " + constituent_uri + " . "
				,  " OPTIONAL { "
				,  " ?object crm:P129i_is_subject_of ?description_class . "
				,  " ?description_class a crm:E33_Linguistic_Object ; "
				,  " crm:P2_has_type <http://vocab.getty.edu/aat/300404670> ; "
				,  " crm:P2_has_type <http://vocab.getty.edu/aat/300080091> ; "
				,  " rdf:value ?description . "
				,  " } "
				,  " OPTIONAL { "
				,  " ?object crm:P102_has_title ?primary_title_class . "
				,  " ?primary_title_class a crm:E35_Title ; "
				,  " rdf:value ?title ; "
				,  " crm:P2_has_type <http://vocab.getty.edu/aat/300404670> . "
				,  " } "
				,  " OPTIONAL { "
				,  " ?object crm:P138i_has_representation ?image . "
				,  " ?image a crm:E38_Image . "
				,  " } "
				,  " OPTIONAL { "
				,  " ?object crm:P52_has_current_owner ?museum_uri . "
				,  " ?museum_uri rdfs:label ?museum_name . "
				,  " } "				
				,  " } ");
		System.out.println("\tExecuting : \n\t" + queryString);
		try{
			FileWriter fw = new FileWriter(aac_object_results,true);
			Query query = QueryFactory.create(queryString);
			QueryExecution qExe = QueryExecutionFactory.sparqlService(AAC_SPARQL_ENDPOINT, query );
			ResultSet results = qExe.execSelect();
			String data;
			while(results.hasNext()){
		   		Binding binding = results.nextBinding();
		   		Iterator<Var> vars = binding.vars();
		   		String object = "";
		   		String title = "";
		   		String description = "";
		   		String image_uri = "";
		   		String museum_uri = "";
		   		String museum_name = "";
		   		
		   		while(vars.hasNext()){        		
		   			Var var = vars.next();
		   			Node node = binding.get(var);
		   			String name = var.getVarName();
		   			String value;
		   			if(node.isURI())
		   				value = node.getURI();
		   			else
		   				value = node.getLiteralValue().toString();
	    			//System.out.println("Name : " + name + " Value : " + value);		   		
		   			if(name.equals("object")){
		   				object = '<' + value + '>';		   				
		   			}
		   			else if(name.equals("title")){
		   				title = value;				   		
		   			}
		   			else if(name.equals("description")){
		   				description = value.replace('\n', ' ');				   		
		   			}
		   			else if(name.equals("image")){
		   				image_uri = '<' + value + '>';				   		
		   			}
		   			else if(name.equals("museum_uri")){
		   				museum_uri = '<' + value + '>';				   		
		   			}
		   			else if(name.equals("museum_name")){
		   				museum_name = value;	   			   				
		   			}
		   		}
		   		if(object != ""){
	   				data = dbpedia_uri + " " + "<http://dbpedia.org/ontology/producer>" + " " + object + " .";
					System.out.println("\t\t" + data);
			   		fw.write(data + "\n");	
			   		data = object + " " + "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>" + " " + "<http://dbpedia.org/ontology/Work> .";
			   		fw.write(data + "\n");
			   		System.out.println("\t\t" + data);
			   		
			   		if(title != ""){
			   			data = object + " " + "<http://www.w3.org/2000/01/rdf-schema#label>" + " \"\"\"" + title + " \"\"\"@en ."; 
				   		System.out.println("\t\t" + data);
				   		fw.write(data + "\n");
			   		}
			   		if(description != ""){
			   			data = object + " " + "<http://dbpedia.org/ontology/abstract>" + " \"\"\"" + description + " \"\"\" .";
				   		System.out.println("\t\t" + data);
				   		fw.write(data + "\n");
			   		}
			   		if(image_uri != ""){
			   			data = object + " " + "<http://dbpedia.org/ontology/thumbnail>" + " " + image_uri + " .";
				   		System.out.println("\t\t" + data);
				   		fw.write(data + "\n");
			   		}
			   		if(museum_uri != ""){
			   			data = object + " " + "<http://dbpedia.org/ontology/museum>" + " " + museum_uri + " .";
			   			System.out.println("\t\t" + data);
			   			fw.write(data + "\n");
			   		}
			   		if(museum_name != ""){
			   			data = museum_uri + " " + "<http://www.w3.org/2000/01/rdf-schema#label>" + " \"\"\"" + museum_name + " \"\"\"@en ."; 
				   		System.out.println("\t\t" + data);
				   		fw.write(data + "\n");
			   		}
		   		}
		   		//System.out.println(object + "\t" + title + "\t" + description + "\t" + image_uri+ "\t" + museum_uri + "\t" + museum_name);
			}
			fw.flush();
	        fw.close();
        }catch(Exception e){
        	System.out.println("exception " + e);   
        }
	}
	public static void getDbPediaResource(String constituent_uri, String ulan_resource, String museum_uri, String aac_dbpedia_results, String aac_object_results){

		System.out.println("AacDbpedia::getDbPediaResource ulan = " + ulan_resource);
		
		String queryString = String.join(""
				, "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
				, "PREFIX owl: <http://www.w3.org/2002/07/owl#> "
				, "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
				, "PREFIX dbp: <http://dbpedia.org/property/> "
				, "PREFIX dbo: <http://dbpedia.org/ontology/> "
				, "SELECT ?dbr ?label ?comment ?placeOfBirth ?desc ?abstract "
				, "WHERE { "
				, "{ "
				, "		SELECT ?dbr "
				, "		WHERE { "
				, " 		?dbr owl:sameAs ?wiki_entity. " 
				, " 		?wiki_entity rdfs:seeAlso " + ulan_resource + " . } "
				, "} "
				, "{ "
				, "		SELECT DISTINCT ?dbr ?label ?comment ?placeOfBirth ?desc ?abstract "
				, "		WHERE { "
				, "		?dbr ?predicate ?object . "
				, "		OPTIONAL { ?dbr rdfs:label ?label1 " 
				, "				FILTER(langmatches(lang(?label1),'en')) "
				, "				BIND(str(?label1) AS ?label) "
				, "		} . "
				, "		OPTIONAL { ?dbr rdfs:comment ?comment1 "
				, "				FILTER(langmatches(lang(?comment1),'en')) "
				, "				BIND(str(?comment1) AS ?comment) "
				, "		} . "
				, "		OPTIONAL { ?dbr dbp:placeOfBirth ?placeOfBirth1 " 
				, "				FILTER(langmatches(lang(?placeOfBirth1),'en')) "
				, "             BIND(str(?placeOfBirth1) AS ?placeOfBirth) "
				, "          } . "
				, "		OPTIONAL { ?dbr <http://purl.org/dc/elements/1.1/description> ?desc1 " 
				, "             FILTER(langmatches(lang(?desc1),'en')) "
				, "             BIND(str(?desc1) AS ?desc) "
				, "          } . "
				, "		OPTIONAL { ?dbr dbo:abstract ?abstract1 " 
				, "             FILTER(langmatches(lang(?abstract1),'en')) "
				, "             BIND(str(?abstract1) AS ?abstract) "
				, "          } . "
				, "		} "
				, "} "
				, "} ");
		
		
		System.out.println("Executing : \n\t" + queryString);
		
		Query query = QueryFactory.create(queryString);
		QueryExecution qExe = QueryExecutionFactory.sparqlService(DBPEDIA_SPARQL_ENDPOINT, query );
		ResultSet results = qExe.execSelect();
		
		try{
			FileWriter fw = new FileWriter(aac_dbpedia_results,true);
			
			while(results.hasNext()){
		   		Binding binding = results.nextBinding();
		   		Iterator<Var> vars = binding.vars();
		   		String dbr = "";
		   		String label = "";
		   		String comment = "";
		   		String placeOfBirth = "";
		   		String desc = "";
		   		String abstract_detail = "";
		   		
		   		while(vars.hasNext()){        		
		   			Var var = vars.next();
		   			Node node = binding.get(var);
		   			String name = var.getVarName();
		   			String value = "";
		   			if(node.isURI())
		   				value = node.getURI();
		   			else
		   				value = node.getLiteralValue().toString();
		   			
		   			//System.out.println("Name : " + name);
		   			//System.out.println("Value : " + value);
		   			if(name.equals("dbr"))
		   				dbr = value;
		   			if(name.equals("label"))
		   				label = value; 
		   			if(name.equals("comment"))
		   				comment = value; 
		   			if(name.equals("placeOfBirth"))
		   				placeOfBirth = value; 
		   			if(name.equals("desc"))
		   				desc = value; 
		   			if(name.equals("abstract"))
		   				abstract_detail = value; 		   			
		   		}

		   		//System.out.println(dbr + "\t" + label + "\t" + comment + "\t" + placeOfBirth + "\t" + desc + "\t" + abstract_detail);
		   		if(dbr.length() > 0){
			   		String dbpedia_uri = "<" + dbr + ">";
			   		String data;			   		
			   		data = constituent_uri + " " + "<http://www.w3.org/2004/02/skos/core#exactMatch>" + " " + dbpedia_uri + " .";
			   		System.out.println("\t" + data);
			        fw.write(data + "\n");
			        
			        if (!dbpedia_map.containsKey(dbpedia_uri)){
			        	//System.out.println("Adding " + dbpedia_uri + "\t" + label + "\t" + comment + "\t" + placeOfBirth + "\t" + desc + "\t" + abstract_detail);
			        	Resource r = new Resource(label, comment, placeOfBirth, desc, abstract_detail);
			        	dbpedia_map.put(dbpedia_uri, r);
			        }
			        addConstituentDetail(constituent_uri, dbpedia_uri, aac_object_results);
		   		}     
			}
			
			
			
	        fw.flush();
            fw.close();
		}catch(Exception e){
        	System.out.println("exception " + e);   
        }
		
		System.out.println("******************************************************************");
	}	
	
	public static void main(String[] args) {

		String aac_dbpedia_results = "src/main/resources/aac_dbpedia.ttl";
		String aac_object_results = "src/main/resources/aac_objects.ttl";
		String dbpedia_results = "src/main/resources/dbpedia.ttl";
		String aac_uri_matching = "src/main/resources/aac_uri_matching.json";
		try{
			
            File aac_dbpedia_file = new File(aac_dbpedia_results);            
            // if file doesn't exists, then create it
            if (!aac_dbpedia_file.exists()) {
            	aac_dbpedia_file.createNewFile();
                System.out.println("create new file! Saved to: "+aac_dbpedia_file.getAbsolutePath());
            }
            else{
                System.out.println("File exists! Saved to: "+aac_dbpedia_file.getAbsolutePath());
            }
                       
            File aac_object_file = new File(aac_object_results);            
            // if file doesn't exists, then create it
            if (!aac_object_file.exists()) {
            	aac_object_file.createNewFile();
                System.out.println("create new file! Saved to: "+aac_object_file.getAbsolutePath());
            }
            else{
                System.out.println("File exists! Saved to: "+aac_object_file.getAbsolutePath());
            }
        
            File aac_uri_matching_file = new File(aac_uri_matching);            
            // if file doesn't exists, then create it
            if (!aac_uri_matching_file.exists()) {
            	aac_uri_matching_file.createNewFile();
                System.out.println("create new file! Saved to: "+aac_uri_matching_file.getAbsolutePath());
            }
            else{
                System.out.println("File exists! Saved to: "+aac_uri_matching_file.getAbsolutePath());
            }
            
            File dbpedia_file = new File(dbpedia_results);            
            // if file doesn't exists, then create it
            if (!dbpedia_file.exists()) {
            	dbpedia_file.createNewFile();
                System.out.println("create new file! Saved to: "+dbpedia_file.getAbsolutePath());
            }
            else{
                System.out.println("File exists! Saved to: "+dbpedia_file.getAbsolutePath());
            }
            
			String queryString = String.join(""
					 , "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> "
			         , "SELECT ?constituent_uri ?ulan_uri ?museum "
			         , "WHERE { GRAPH ?museum { "
			         , "?constituent_uri ?predicate ?ulan_uri "
			         , "FILTER (?predicate = skos:exactMatch) "
			         , "} FILTER(!REGEX(STR(?museum),'curated')) }");
			System.out.println("Executing : \n\t" + queryString);
			
			Query query = QueryFactory.create(queryString);
			ARQ.getContext().setTrue(ARQ.useSAX);
			QueryExecution qExe = QueryExecutionFactory.sparqlService(AAC_SPARQL_ENDPOINT, query );
			ResultSet results = qExe.execSelect();
			while(results.hasNext()){
		   		Binding binding = results.nextBinding();
		   		Iterator<Var> vars = binding.vars();
		   		String constituent_uri = "";
		   		String ulan_uri = "";
		   		String museum_uri = "";
		   		
		   		while(vars.hasNext()){        		
		   			Var var = vars.next();
		   			Node node = binding.get(var);
		   			String name = var.getVarName();
		   			String value;
		   			if(node.isURI())
		   				value = node.getURI();
		   			else
		   				value = node.getLiteralValue().toString();
	    			//System.out.println("Name : " + name + " Value : " + value);
		   			if(name.equals("constituent_uri"))
		   				constituent_uri = '<' + value + '>';
		   			else if(name.equals("ulan_uri"))
		   				ulan_uri = '<' + value + '>';
		   			else if(name.equals("museum"))
		   				museum_uri = '<' + value + '>';    			
		   		}
		   		//System.out.println(constituent_uri + "\t" + ulan_uri + "\t" + museum);
		   		try{
		   			getDbPediaResource(constituent_uri, ulan_uri, museum_uri, aac_dbpedia_results, aac_object_results);
		   		}catch(Exception e){
		   			System.out.println(e);
		   		}
			}	

			FileWriter fw = new FileWriter(dbpedia_results,true);
			JSONArray values = new JSONArray();
			for(Map.Entry<String, Resource> entry:dbpedia_map.entrySet()){    
		        String key = entry.getKey();  
		        Resource r = entry.getValue();  
		        //r.label, r.comment, r.placeOfBirth, r.desc, r.abstract_detail
		        System.out.println("\n" + key+" Details: \n" + r.label +" "+ r.comment+" "+r.placeOfBirth+" "+r.desc+" "+r.abstract_detail);
		        String dbpedia_uri = key;
		        String data;
		        String label = r.label;
		        String comment = r.comment;
		        String placeOfBirth = r.placeOfBirth;
		        String desc = r.desc;
		        String abstract_detail = r.abstract_detail;
		        
		        String uri_pattern_str = "<(.*)>";
		        String person_pattern_str = "http://dbpedia.org/resource/(.*)";
		        
		        Pattern uri_pattern = Pattern.compile(uri_pattern_str);
		        Pattern person_pattern = Pattern.compile(person_pattern_str);
		        
		        Matcher uri_pattern_match = uri_pattern.matcher(dbpedia_uri);
		        		        
		        if (uri_pattern_match.find()) {
		        	String uri = uri_pattern_match.group(1);		        
		        	Matcher person_pattern_match = person_pattern.matcher(uri);
		        	
		        	if (person_pattern_match.find()){
		        		String person_str = person_pattern_match.group(1);
		        		String person = person_str.replace('_', ' ');
		        		System.out.println(uri + " " + person);
		        		JSONObject obj = new JSONObject();
		        		obj.put("uri", uri);
		        		obj.put("name", person);
		        		values.put(obj);
		        	}		        			        	
		        }else {
		            System.out.println("NO MATCH");
		        }
		        
	   			data = dbpedia_uri + " " + "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>" + " " + "<http://dbpedia.org/ontology/Person>" + " .";
				System.out.println("\t" + data);
		   		fw.write(data + "\n");
		   		
		        if(label.length()>0){
			   		data = dbpedia_uri + " " + "<http://www.w3.org/2000/01/rdf-schema#label>" + " \"\"\"" + label + " \"\"\"@en .";
			   		System.out.println("\t" + data);
			        fw.write(data + "\n");
		        }
		        if(comment.length()>0){
			   		data = dbpedia_uri + " " + "<http://www.w3.org/2000/01/rdf-schema#comment>" + " \"\"\"" + comment + " \"\"\" .";
			   		System.out.println("\t" + data);
			        fw.write(data + "\n");
		        }
		        if(placeOfBirth.length()>0){
			   		data = dbpedia_uri + " " + "<http://dbpedia.org/property/placeOfBirth>" + " \"\"\"" + placeOfBirth + " \"\"\" .";
			   		System.out.println("\t" + data);
			        fw.write(data + "\n");
		        }
		        if(desc.length()>0){
			   		data = dbpedia_uri + " " + "<http://purl.org/dc/elements/1.1/description>" + " \"\"\"" + desc + " \"\"\" .";
			   		System.out.println("\t" + data);
			        fw.write(data + "\n");
		        }
		        if(abstract_detail.length()>0){
			   		data = dbpedia_uri + " " + "<http://dbpedia.org/ontology/abstract>" + " \"\"\"" + abstract_detail + " \"\"\" .";
			   		System.out.println("\t" + data);
			        fw.write(data + "\n");
		        }
		    }
			fw.flush();
            fw.close();
            
			System.out.println("Results Saved to : " + aac_dbpedia_results);
			System.out.println("Results Saved to : " + aac_object_results);
			System.out.println("Results Saved to : " + dbpedia_results);
			FileWriter json_fw = new FileWriter(aac_uri_matching,true);
			json_fw.write(values.toString());
			json_fw.flush();
			json_fw.close();
			System.out.println("Results Saved to : " + aac_uri_matching);
        } catch(Exception e){
            System.out.println("exception " + e);   
        }
	}

}
