package com.example.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.AnnouncementRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.model.User;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.Announcement;
import com.example.taskmanager.model.Project;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.util.Objects;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ProjectRepository projectRepository;

    // --- USER MANAGEMENT ---
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // --- TASK OVERSIGHT ---
    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping("/tasks/assign")
    public Task assignTask(@RequestBody Task task, @RequestParam Long userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId)).orElseThrow();
        task.setUser(user);
        task.setStatus("PENDING");
        return taskRepository.save(task);
    }

    @PutMapping("/tasks/{id}")
    public Task editTaskGlobal(@PathVariable Long id, @RequestBody Task details) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setTitle(details.getTitle());
        task.setDescription(details.getDescription());
        task.setDueDate(details.getDueDate());
        return taskRepository.save(task);
    }

    @PutMapping("/tasks/{id}/approve")
    public Task approveTask(@PathVariable Long id, @RequestParam String adminEmail) {
        Task task = taskRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        task.setStatus("APPROVED");
        task.setApprovedBy(adminEmail);
        return taskRepository.save(task);
    }

    @PutMapping("/tasks/{id}/reject")
    public Task rejectTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setStatus("REJECTED");
        return taskRepository.save(task);
    }

    @DeleteMapping("/tasks/{id}")
    public String deleteTask(@PathVariable Long id) {
        if (id != null) {
            taskRepository.deleteById(id);
            return "Task deleted by Admin";
        }
        return "Invalid ID";
    }

    @DeleteMapping("/tasks/purge-old")
    public String purgeOldTasks() {
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        List<Task> allTasks = taskRepository.findAll();
        List<Task> oldTasks = allTasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(monthAgo)
                        && "APPROVED".equals(t.getStatus()))
                .toList();
        taskRepository.deleteAll(oldTasks);
        return oldTasks.size() + " old tasks purged.";
    }

    // --- SYSTEM UTILITY ---
    @PostMapping("/announcements")
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        announcement.setCreatedAt(java.time.LocalDateTime.now());
        return announcementRepository.save(announcement);
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTasks", taskRepository.count());
        stats.put("completedTasks",
                taskRepository.findAll().stream().filter(t -> "APPROVED".equals(t.getStatus())).count());
        stats.put("pendingTasks",
                taskRepository.findAll().stream().filter(t -> !"APPROVED".equals(t.getStatus())).count());
        return stats;
    }

    // --- PROJECT MANAGEMENT ---
    @PostMapping("/projects")
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @GetMapping("/projects")
    public List<Project> getProjects() {
        return projectRepository.findAll();
    }
}
