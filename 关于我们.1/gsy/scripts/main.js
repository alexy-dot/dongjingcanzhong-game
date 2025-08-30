// 主要JavaScript功能
class PersonalWebsite {
    constructor() {
        this.currentPage = 'home';
        this.blogPosts = [];
        this.friends = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBlogPosts();
        this.loadFriends();
        this.setupScrollAnimations();
        this.hideLoader();
    }

    setupEventListeners() {
        // 导航菜单点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });

        // 移动端菜单切换
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // 返回顶部按钮
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 滚动事件
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // 联系表单提交
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e.target);
            });
        }

        // 笔记分类点击事件
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.openNotesCategory(category);
            });
        });

        // 博客筛选按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterBlogPosts(filter);
            });
        });
    }

    navigateToPage(pageName) {
        // 隐藏当前页面
        const currentPage = document.querySelector(`#${this.currentPage}`);
        if (currentPage) {
            currentPage.classList.remove('active');
        }

        // 显示目标页面
        const targetPage = document.querySelector(`#${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }

        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 触发页面切换动画
        this.triggerPageAnimations(pageName);
    }

    triggerPageAnimations(pageName) {
        // 为不同页面添加进入动画
        const page = document.querySelector(`#${pageName}`);
        if (page) {
            const elements = page.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale');
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('animate');
                }, index * 100);
            });
        }
    }

    loadBlogPosts() {
        // 模拟博客数据
        /*this.blogPosts = [
            {
                id: 1,
                title: '深度学习入门：从零开始理解神经网络',
                excerpt: '本文介绍了深度学习的基础概念，包括神经网络的结构、激活函数、损失函数等核心概念，适合初学者阅读。',
                image: 'assets/images/blog/deep-learning.jpg',
                date: '2025-8-28',
                category: 'deep-learning',
                tags: ['深度学习', '神经网络', 'AI入门'],
                author: 'Alexy'
            },
            {
                id: 2,
                title: '机器人运动学基础：DH参数详解',
                excerpt: '详细介绍了机器人运动学中的DH参数表示方法，包括坐标系建立、参数定义和变换矩阵计算。',
                image: 'assets/images/blog/robotics.jpg',
                date: '2025-8-28',
                category: 'robotics',
                tags: ['机器人学', '运动学', 'DH参数'],
                author: 'Alexy'
            },
            {
                id: 3,
                title: '数据结构与算法：红黑树的实现',
                excerpt: '深入解析红黑树的数据结构和算法实现，包括插入、删除操作的详细步骤和代码实现。',
                image: 'assets/images/blog/dsa.jpg',
                date: '2025-8-28',
                category: 'dsa',
                tags: ['数据结构', '算法', '红黑树'],
                author: 'Alexy'
            },
            {
                id: 4,
                title: '人工智能前沿：大语言模型的发展趋势',
                excerpt: '探讨了大语言模型的发展历程、技术突破和未来发展方向，分析了AI技术的演进路径。',
                image: 'assets/images/blog/ai.jpg',
                date: '2025-8-28',
                category: 'ai',
                tags: ['人工智能', '大语言模型', '技术趋势'],
                author: 'Alexy'
            },
            {
                id: 5,
                title: '机器学习实战：图像分类项目',
                excerpt: '通过一个完整的图像分类项目，展示了机器学习从数据预处理到模型训练的完整流程。',
                image: 'assets/images/blog/ml.jpg',
                date: '2025-8-28',
                category: 'ml',
                tags: ['机器学习', '图像分类', '实战项目'],
                author: 'Alexy'
            },
            {
                id: 6,
                title: '读书分享：《人工智能：一种现代方法》',
                excerpt: '分享阅读经典AI教材的心得体会，总结了书中的核心概念和重要知识点。',
                image: 'assets/images/blog/reading.jpg',
                date: '2025-8-28',
                category: 'reading',
                tags: ['读书分享', '人工智能', '教材推荐'],
                author: 'Alexy'
            }
        ];*/

        this.renderBlogPosts();
    }

    renderBlogPosts(filter = 'all') {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;

        const filteredPosts = filter === 'all' 
            ? this.blogPosts 
            : this.blogPosts.filter(post => post.category === filter);

        blogGrid.innerHTML = filteredPosts.map(post => `
            <article class="blog-card hover-lift">
                <img src="${post.image}" alt="${post.title}" class="blog-image" onerror="this.src='assets/images/blog/default.jpg'">
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="fas fa-calendar"></i> ${post.date}</span>
                        <span><i class="fas fa-user"></i> ${post.author}</span>
                    </div>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-tags">
                        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        // 添加进入动画
        setTimeout(() => {
            const cards = blogGrid.querySelectorAll('.blog-card');
            cards.forEach((card, index) => {
                card.classList.add('fade-in-up');
                setTimeout(() => {
                    card.classList.add('animate');
                }, index * 100);
            });
        }, 100);
    }

    filterBlogPosts(filter) {
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // 重新渲染博客文章
        this.renderBlogPosts(filter);
    }

    loadFriends() {
        // 模拟朋友数据
       /* this.friends = [
            {
                id: 1,
                name: '1',
                title: '计算机科学专业',
                description: '暂无。',
                avatar: 'assets/images/friends/friend1.jpg',
                website: 'https://example1.com'
            },
            {
                id: 2,
                name: '2',
                title: '人工智能专业',
                description: '专注于计算机视觉研究，在图像识别领域有丰富经验。',
                avatar: 'assets/images/friends/friend2.jpg',
                website: 'https://example2.com'
            },
            {
                id: 3,
                name: '3',
                title: '机器人工程专业',
                description: '机器人控制专家，擅长运动规划和轨迹优化算法。',
                avatar: 'assets/images/friends/friend3.jpg',
                website: 'https://example3.com'
            },
            {
                id: 4,
                name: '4',
                title: '软件工程专业',
                description: '全栈开发工程师，热爱开源项目，技术栈广泛。',
                avatar: 'assets/images/friends/friend4.jpg',
                website: 'https://example4.com'
            }
        ];*/

        this.renderFriends();
    }

    renderFriends() {
        const friendsGrid = document.getElementById('friendsGrid');
        if (!friendsGrid) return;

        friendsGrid.innerHTML = this.friends.map(friend => `
            <div class="friend-card hover-lift">
                <img src="${friend.avatar}" alt="${friend.name}" class="friend-avatar" onerror="this.src='assets/images/friends/default.jpg'">
                <h3 class="friend-name">${friend.name}</h3>
                <p class="friend-title">${friend.title}</p>
                <p class="friend-description">${friend.description}</p>
                <a href="${friend.website}" class="friend-link" target="_blank">
                    <i class="fas fa-external-link-alt"></i> 访问主页
                </a>
            </div>
        `).join('');

        // 添加进入动画
        setTimeout(() => {
            const cards = friendsGrid.querySelectorAll('.friend-card');
            cards.forEach((card, index) => {
                card.classList.add('fade-in-scale');
                setTimeout(() => {
                    card.classList.add('animate');
                }, index * 150);
            });
        }, 100);
    }

    openNotesCategory(category) {
        // 这里可以实现跳转到具体笔记分类页面的逻辑
        // 目前先显示一个提示
        this.showNotification(`即将跳转到${this.getCategoryName(category)}笔记页面`);
    }

    getCategoryName(category) {
        const categoryNames = {
            'dsa': '数据结构与算法',
            'deep-learning': '深度学习',
            'robotics': '机器人',
            'ai': '人工智能',
            'reading': '读书分享'
        };
        return categoryNames[category] || category;
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        // 这里可以添加表单验证和提交逻辑
        console.log('联系表单提交:', { name, email, message });
        
        // 显示成功消息
        this.showNotification('留言已发送，感谢您的反馈！');
        
        // 重置表单
        form.reset();
    }

    showNotification(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // 观察所有需要动画的元素
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale').forEach(el => {
            observer.observe(el);
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const backToTopBtn = document.getElementById('backToTop');

        if (backToTopBtn) {
            if (scrollTop > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }

        // 导航栏滚动效果
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrollTop > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    }

    hideLoader() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 1000);
        }
    }
}

// 工具函数
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PersonalWebsite();
});

// 添加一些全局的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 为所有卡片添加悬停效果
    document.querySelectorAll('.category-card, .hobby-card, .contact-card').forEach(card => {
        card.classList.add('hover-lift');
    });

    // 为图标添加动画效果
    document.querySelectorAll('.category-icon, .hobby-icon, .contact-icon').forEach(icon => {
        icon.classList.add('hover-scale');
    });

    // 添加粒子效果到首页
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.classList.add('particles');
        this.createParticles(heroSection);
    }
});

// 创建粒子效果
function createParticles(container) {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        container.appendChild(particle);
    }
} 