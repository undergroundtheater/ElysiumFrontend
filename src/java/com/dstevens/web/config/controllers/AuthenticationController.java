package com.dstevens.web.config.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.dstevens.config.Authorization;
import com.dstevens.config.controllers.ForbiddenException;
import com.dstevens.user.ElysiumUserDetailsService;
import com.google.gson.Gson;

@Controller
public class AuthenticationController {

	private ElysiumUserDetailsService userService;

	@Autowired
	public AuthenticationController(ElysiumUserDetailsService userService) {
		this.userService = userService;
	}
	
	@RequestMapping(value = "/authenticate", method = RequestMethod.POST)
	public @ResponseBody String authenticate(@RequestBody AuthorizationRequest request) {
		UserDetails userDetails = userService.loadUserByUsername(request.username);
		if(userDetails.getUsername().equals(request.username) &&
		   userDetails.getPassword().equals(request.password)) {
			Authorization authorize = userService.authorize(new UsernamePasswordAuthenticationToken(request.username, request.password, userDetails.getAuthorities()));
			return new Gson().toJson(DisplayableAuthorization.from(authorize));
		}
		throw new ForbiddenException("User not authenticated");
	}
	
	private static class AuthorizationRequest {
		public String username;
		public String password;
	}
	
	@SuppressWarnings("unused")
	private static class DisplayableAuthorization {
		public String username;
		public String token;
		
		public DisplayableAuthorization(String username, String token) {
			this.username = username;
			this.token = token;
		}

		public static DisplayableAuthorization from(Authorization authorization) {
			return new DisplayableAuthorization(authorization.getUsername(), authorization.getToken());
		}
	}
	
}
