package com.dstevens.web.admin.controllers;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

import com.dstevens.troupe.DisplayableTroupe;
import com.dstevens.troupe.Troupe;
import com.dstevens.troupe.TroupeRepository;
import com.dstevens.troupe.UnknownTroupeException;
import com.dstevens.user.DisplayableUser;
import com.dstevens.user.User;
import com.dstevens.user.UserRepository;
import com.google.gson.Gson;

@Controller
public class TroupeController {

	private final TroupeRepository troupeRepository;
	private final UserRepository userRepository;

	@Autowired
	public TroupeController(TroupeRepository troupeRepository, UserRepository userRepository) {
		this.troupeRepository = troupeRepository;
		this.userRepository = userRepository;
	}
	
	@RequestMapping(value = "/admin/page/troupes", method = RequestMethod.GET)
	public ModelAndView getTroupesPage() {
		return new ModelAndView("/admin/troupe/troupes");
	}
	
	@RequestMapping(value = "/admin/page/troupes/{id}", method = RequestMethod.GET)
	public ModelAndView getManageTroupePage(@PathVariable Integer id) {
		Troupe troupe = troupeRepository.findWithId(id);
		if(troupe == null) {
			throw new UnknownTroupeException("Could not find troupe with id " + id);
		}
		ModelAndView modelAndView = new ModelAndView("/admin/troupe/manage");
		modelAndView.addObject("troupe", getTroupe(troupe.getId()));
		return modelAndView;
	}
	
	@ResponseStatus(value=HttpStatus.CREATED)
	@RequestMapping(value = "/troupes", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody void  addTroupe(@RequestBody final DisplayableTroupe troupe) {
		troupeRepository.ensureExists(troupe.name, troupe.venue.to());
	}
	
	@ResponseStatus(value=HttpStatus.NO_CONTENT)
	@RequestMapping(value = "/troupes/{id}", method = RequestMethod.DELETE)
	public @ResponseBody void deleteTroupe(@PathVariable Integer id) {
		Troupe troupeToDelete = troupeRepository.findWithId(id);
		if(troupeToDelete != null) {
			troupeRepository.delete(troupeToDelete);
		}
	}
	
	@RequestMapping(value = "/troupes/{id}", method = RequestMethod.POST)
	public @ResponseBody void updateTroupe(@PathVariable Integer id, @RequestBody final DisplayableTroupe displayedTroupe) {
		Troupe troupe = troupeRepository.findWithId(id);
		if(troupe == null) {
			throw new UnknownTroupeException("Could not find troupe with id " + id);
		}
		//		return storytellers.stream().map((DisplayableUser t) -> userRepository.findUser(t.id)).collect(Collectors.toSet());
		troupeRepository.save(troupe.withName(displayedTroupe.name).withVenue(displayedTroupe.venue.to()).withStorytellers(storytellersFor(displayedTroupe)));
	}

	private Set<User> storytellersFor(final DisplayableTroupe displayedTroupe) {
		return displayedTroupe.storytellers.stream().map((DisplayableUser t) -> userRepository.findUser(t.id)).collect(Collectors.toSet());
	}
	
	private String getTroupe(@PathVariable Integer id) {
		Troupe troupe = troupeRepository.findWithId(id);
		return new Gson().toJson(DisplayableTroupe.fromTroupes().apply(troupe));
	}
	
	@RequestMapping(value = "/troupes", method = RequestMethod.GET)
	public @ResponseBody String getTroupes() {
		List<DisplayableTroupe> collect = StreamSupport.stream(troupeRepository.findAllUndeleted().spliterator(), false).
				             map(DisplayableTroupe.fromTroupes()).
				             sorted().
				             collect(Collectors.toList());
		return new Gson().toJson(collect);
	}
}
