package com.dstevens.users;

import static java.util.UUID.randomUUID;

import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dstevens.suppliers.ClockSupplier;

@Service
public class UserPasswordResetTokenService {

	private final ClockSupplier clockSupplier;
	private final UserPasswordResetTokenDao dao;

	@Autowired
	public UserPasswordResetTokenService(ClockSupplier clockSupplier, UserPasswordResetTokenDao dao) {
		this.clockSupplier = clockSupplier;
		this.dao = dao;
	}
	
	public String produceTokenExpiringIn(String email, int minutes) {
		String resetToken = randomUUID().toString();
		dao.save(new UserPasswordResetToken(email, resetToken, Date.from(clockSupplier.get().instant().plus(minutes, ChronoUnit.MINUTES))));
		return resetToken;
	}
	
	public boolean isResetPasswordTokenValid(String email, String token) {
		return dao.findToken(email, token).isExpiredAsOf(clockSupplier.get());
	}
	
}
