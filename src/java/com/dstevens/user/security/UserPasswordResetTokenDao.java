package com.dstevens.user.security;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface UserPasswordResetTokenDao extends CrudRepository<UserPasswordResetToken, Integer> {

	@Query("SELECT a FROM UserPasswordResetToken a WHERE a.email = ?1 AND a.resetToken = ?2")
	UserPasswordResetToken findToken(String email, String resetToken);
	
}
