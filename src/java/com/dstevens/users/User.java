package com.dstevens.users;

import static com.dstevens.collections.Sets.set;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.annotations.ForeignKey;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.dstevens.suppliers.IdSupplier;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="User")
@SuppressWarnings("deprecation")
public class User implements UserDetails {

	private static final long serialVersionUID = -7180299088295506267L;

	@Id
    private final String id;
    
    @Column(name="name")
    private final String name;
    
    @Column(name="email")
    private final String email;
    
    @Column(name="password")
    private final String password;
    
	@ElementCollection
    @ForeignKey(name="User_Roles_FK")
    private final Set<Role> roles;

    //Hibernate only
    @SuppressWarnings("unused")
    @Deprecated
	private User() {
    	this(null, null, null, set());
    }
    
    public User(String name, String email, String password, Set<Role> roles) {
		this.id = new IdSupplier().get();
		this.name = name;
		this.email = email;
		this.password = password;
		this.roles = roles;
    }
    
    public String getName() {
		return name;
	}
    
    public String getEmail() {
		return email;
	}
    
    public String getPassword() {
    	return password;
    }
    
    public Set<Role> getRoles() {
		return roles;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return this.getRoles().stream().map((Role r) -> new SimpleGrantedAuthority("ROLE_" + r.name())).collect(Collectors.toSet());
	}

	@Override
	public String getUsername() {
		return name;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}