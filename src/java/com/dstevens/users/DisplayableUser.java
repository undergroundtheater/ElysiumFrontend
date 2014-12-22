package com.dstevens.users;

import java.util.Comparator;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.dstevens.characters.DisplayablePlayerCharacter;

public class DisplayableUser implements Comparable<DisplayableUser> {

	public String id;
	public String firstName;
	public String lastName;
	public String email;
	public Set<Integer> roles;
	public Set<DisplayablePlayerCharacter> characters;
	
	private DisplayableUser(String id, String firstName, String lastName, String email, Set<Integer> roles, Set<DisplayablePlayerCharacter> characters) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.roles = roles;
		this.characters = characters;
	}
	
	public Set<Role> roles() {
		return roles.stream().map((Integer i) -> Role.values()[i]).collect(Collectors.toSet());
	}
	
	public static Function<User, DisplayableUser> fromUser() {
		return (User t) -> new DisplayableUser(t.getId(), t.getFirstName(), t.getLastName(), t.getEmail(), 
				                               t.getRoles().stream().map((Role r) -> r.ordinal()).collect(Collectors.toSet()), 
				                               t.getCharacters().stream().map(DisplayablePlayerCharacter.fromCharacter()).collect(Collectors.toSet()));
	}

	@Override
	public int compareTo(DisplayableUser that) {
		return Comparator.comparing((DisplayableUser t) -> t.lastName == null ? "" : t.lastName).
			thenComparing(Comparator.comparing((DisplayableUser t) -> t.firstName == null ? "" : t.firstName)).
			thenComparing(Comparator.comparing((DisplayableUser t) -> t.email == null ? "" : t.email)).
			thenComparing(Comparator.comparing((DisplayableUser t) -> t.id)).
			compare(this, that);
	}
	
}
