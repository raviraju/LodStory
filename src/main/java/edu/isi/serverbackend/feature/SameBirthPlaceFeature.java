package edu.isi.serverbackend.feature;

import java.util.*;
import org.openrdf.query.*;
import org.openrdf.repository.*;

import edu.isi.serverbackend.feature.util.Sample;

public class SameBirthPlaceFeature {
	public static void isSameBirthPlace(List<Sample> samples){
		if(!samples.isEmpty()){
			HashSet<String> samePlaceSet = new HashSet<String>();  
			String currentURI;
			if(samples.get(0).getLink().isSubjectConnection()){
				currentURI = samples.get(0).getLink().getSubject().getURI();
			}
			else{
				currentURI = samples.get(0).getLink().getObject().getURI();
			}
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			StringBuffer queryBuffer = new StringBuffer();
			queryBuffer.append("SELECT ?s WHERE {");
			queryBuffer.append("<"+currentURI+"> dbpedia-owl:birthPlace ?loc.");
			queryBuffer.append("?s dbpedia-owl:birthPlace ?loc. ");
			StringBuffer filterQueryBuffer = new StringBuffer();
			filterQueryBuffer.append("FILTER(");
			
			for(int i = 0; i < samples.size(); i++){
				if(samples.get(i).getLink().isSubjectConnection()){
					filterQueryBuffer.append("?s = <" + samples.get(i).getLink().getObject().getURI() + ">");
				}
				else{
					filterQueryBuffer.append("?s = <" + samples.get(i).getLink().getSubject().getURI() + ">");
				}
				if(i < samples.size() - 1){
					filterQueryBuffer.append(" OR ");
				}
			}
			filterQueryBuffer.append( "). }");
			queryBuffer.append(filterQueryBuffer);
			System.out.println(queryBuffer);
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, queryBuffer.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					samePlaceSet.add(bindingSet.getValue("s").stringValue());
				}
			} catch (RepositoryException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (MalformedQueryException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (QueryEvaluationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			for(Sample sample:samples){
				if(sample.getLink().isSubjectConnection()){
					if(samePlaceSet.contains(sample.getLink().getObject().getURI())){
						sample.setSameBirthPlace(1);
					}
				}
				else{
					if(samePlaceSet.contains(sample.getLink().getSubject().getURI())){
						sample.setSameBirthPlace(1);
					}
				}
			}
		}
	}
}
