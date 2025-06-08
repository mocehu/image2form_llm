<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="footer-text">MOCEHU 版权所有</p>
      <div class="footer-links">
        <a href="#" class="footer-link">隐私政策</a>
        <a href="#" class="footer-link">服务条款</a>
        <a href="#" class="footer-link">联系我们</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: var(--vp-radius-xl);
  background: var(--vp-card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--vp-border);
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-text {
  color: var(--vp-text-secondary);
  font-size: 0.95rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  color: var(--vp-text-muted);
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--vp-primary);
}

@media (max-width: 640px) {
  .footer {
    padding: 1.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 