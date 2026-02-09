package com.example.taskmanager.controller;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private com.example.taskmanager.repository.AnnouncementRepository announcementRepository;

    @GetMapping("/announcements")
    public List<com.example.taskmanager.model.Announcement> getAnnouncements() {
        return announcementRepository.findAll();
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        if (!"admin@jobhook.com".equals(email)) {
            throw new RuntimeException("Access denied: Only Admin can create tasks");
        }
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        Task existingTask = taskService.getTaskById(id).orElseThrow(() -> new RuntimeException("Task not found"));

        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        boolean isAdmin = "admin@jobhook.com".equals(email);

        String status = existingTask.getStatus();
        if (("SUBMITTED".equals(status) || "APPROVED".equals(status)) && !isAdmin) {
            throw new RuntimeException("Access denied: Submitted or Approved tasks are locked and cannot be modified.");
        }

        return taskService.updateTask(id, taskDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        if (!"admin@jobhook.com".equals(email)) {
            throw new RuntimeException("Access denied: Only Admin can delete tasks");
        }
        taskService.deleteTask(id);
    }
}
