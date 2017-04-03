package edu.isi.serverbackend.localDatabase.bean;

public class ConnectionBean {
	
	private int connectionId;
	private String predicate;
	private String namespace;
	private int subjectId;
	private int objectId;
	private int subjectRank;
	private int objectRank;
	
	
	public ConnectionBean(){
		subjectRank = -1;
		objectRank = -1;
	}
	
	public int getConnectionId() {
		return connectionId;
	}
	public void setConnectionId(int connectionId) {
		this.connectionId = connectionId;
	}
	public String getRelation() {
		return predicate;
	}
	public void setRelation(String predicate) {
		this.predicate = predicate;
	}
	public String getNamespace() {
		return namespace;
	}
	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}
	public int getSubjectId() {
		return subjectId;
	}
	public void setSubjectId(int subjectId) {
		this.subjectId = subjectId;
	}
	public int getObjectId() {
		return objectId;
	}
	public void setObjectId(int objectId) {
		this.objectId = objectId;
	}
	public int getSubjectRank() {
		return this.subjectRank;
	}
	public void setSubjectRank(int subjectRank) {
		this.subjectRank = subjectRank;
	}
	public int getObjectRank() {
		return this.objectRank;
	}
	public void setObjectRank(int objectRank) {
		this.objectRank = objectRank;
	}
	
	

}
