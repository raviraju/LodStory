package edu.isi.serverbackend.localDatabase.bean;

public class TripleBean {
	private String tripleID;
	private PredicateBean predicate;
	private NodeBean subject;
	private NodeBean object;
	private double subjectDegree;
	private double objectDegree;
	private double sbjExtensionRarity;
	private double objExtensionRarity;
	
	
	public TripleBean(){
		subjectDegree = -1;
		objectDegree = -1;
	}
	
	public String getTripleID() {
		return this.tripleID;
	}
	public void setTripleID(String tripleID) {
		this.tripleID = tripleID;
	}
	
	public PredicateBean getPredicate() {
		return predicate;
	}

	public void setPredicate(PredicateBean predicate) {
		this.predicate = predicate;
	}

	public NodeBean getSubject() {
		return subject;
	}

	public void setSubject(NodeBean subject) {
		this.subject = subject;
	}

	public NodeBean getObject() {
		return object;
	}

	public void setObject(NodeBean object) {
		this.object = object;
	}

	public double getSubjectDegree() {
		return subjectDegree;
	}
	public void setSubjectDegree(double subjectDegree) {
		this.subjectDegree = subjectDegree;
	}
	public double getObjectDegree() {
		return this.objectDegree;
	}
	public void setObjectDegree(double objectDegree) {
		this.objectDegree = objectDegree;
	}
	public double getSbjExtensionRarity() {
		return sbjExtensionRarity;
	}

	public void setSbjExtensionRarity(double sbjExtensionRarity) {
		this.sbjExtensionRarity = sbjExtensionRarity;
	}

	public double getObjExtensionRarity() {
		return objExtensionRarity;
	}

	public void setObjExtensionRarity(double objExtensionRarity) {
		this.objExtensionRarity = objExtensionRarity;
	}
	
}
