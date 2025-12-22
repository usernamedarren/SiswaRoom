const apiBaseUrl = (process.env.API_URL || 'http://api.siswaroom.online').replace(/\/$/, '');
const apiDomain = process.env.API_DOMAIN || 'api.siswaroom.online';

// Fresh, fully-defined OpenAPI spec (no auto-scanning of comments)
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SiswaRoom API',
    version: '1.0.0',
    description: 'Dokumentasi resmi SiswaRoom (Learning Management System) dengan autentikasi JWT dan prefix /api.',
    contact: {
      name: 'SiswaRoom Team',
      url: 'https://siswaroom.online',
    },
    license: { name: 'MIT' },
  },
  servers: [
    { url: `https://${apiDomain}/api`, description: 'Production API (HTTPS - Cloudflare)' },
    { url: `http://192.168.4.247:4000/api`, description: 'Production API (HTTP - aPanel)' }
  ],
  tags: [
    { name: 'Authentication', description: 'Login dan identitas pengguna' },
    { name: 'Users', description: 'Manajemen data pengguna' },
    { name: 'Courses', description: 'Kursus dan guru pengampu' },
    { name: 'Materials', description: 'Materi belajar per kursus' },
    { name: 'Quizzes', description: 'Bank kuis per kursus' },
    { name: 'Quiz Attempts', description: 'Pengerjaan dan penilaian kuis' },
    { name: 'Library', description: 'Sumber belajar tambahan' },
    { name: 'Health', description: 'Status layanan' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan token JWT tanpa "Bearer " prefix (diisi otomatis oleh UI).'
      }
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Something went wrong' },
          error: { type: 'string', example: 'Validation failed' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'user@example.com' },
          full_name: { type: 'string', example: 'John Doe' },
          role: { type: 'string', enum: ['guru', 'siswa', 'admin'], example: 'siswa' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      Course: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          name: { type: 'string', example: 'Matematika Dasar' },
          description: { type: 'string', example: 'Belajar konsep dasar matematika' },
          teacher_id: { type: 'integer', example: 3 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Material: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 7 },
          course_id: { type: 'integer', example: 12 },
          title: { type: 'string', example: 'Simple Present Tense' },
          short_description: { type: 'string', example: 'Ringkasan konsep' },
          full_description: { type: 'string', example: 'Penjelasan lengkap...' },
          video_url: { type: 'string', example: 'https://video.example.com/lesson' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Quiz: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 5 },
          course_id: { type: 'integer', example: 12 },
          title: { type: 'string', example: 'Kuis 1 - Simple Present' },
          short_description: { type: 'string', example: 'Uji pemahaman dasar' },
          total_questions: { type: 'integer', example: 10 },
          duration_minutes: { type: 'integer', example: 15 },
          passing_score: { type: 'integer', example: 70 },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      QuizAttempt: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 9 },
          quiz_id: { type: 'integer', example: 5 },
          student_id: { type: 'integer', example: 22 },
          score: { type: 'integer', example: 85 },
          passed: { type: 'boolean', example: true },
          started_at: { type: 'string', format: 'date-time' },
          finished_at: { type: 'string', format: 'date-time' }
        }
      },
      LibraryItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 4 },
          title: { type: 'string', example: 'Ringkasan Simple Present' },
          type: { type: 'string', enum: ['ebook', 'catatan', 'bank_soal'], example: 'catatan' },
          short_description: { type: 'string', example: 'Catatan ringkas rumus' },
          course_id: { type: 'integer', example: 12 },
          file_url: { type: 'string', example: 'https://files.example.com/file.pdf' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login berhasil' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'guru1@sekolah.id' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login berhasil', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Data kurang', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          401: { description: 'Email atau password salah' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register user baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'full_name', 'role'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  full_name: { type: 'string' },
                  role: { type: 'string', enum: ['guru', 'siswa', 'admin'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User terdaftar', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Data kurang / sudah ada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Profil user saat ini',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profil', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Daftar seluruh user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Detail user',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: 'Tidak ditemukan' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Perbarui user',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  full_name: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Berhasil diperbarui' },
          404: { description: 'Tidak ditemukan' }
        }
      }
    },
    '/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Daftar kursus',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Course' } } } } }
        }
      },
      post: {
        tags: ['Courses'],
        summary: 'Buat kursus',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'teacher_id'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  teacher_id: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } }
        }
      }
    },
    '/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Detail kursus',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } },
          404: { description: 'Tidak ditemukan' }
        }
      },
      put: {
        tags: ['Courses'],
        summary: 'Perbarui kursus',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Berhasil diperbarui' } }
      },
      delete: {
        tags: ['Courses'],
        summary: 'Hapus kursus',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Dihapus' } }
      }
    },
    '/materials': {
      get: {
        tags: ['Materials'],
        summary: 'Materi per kursus',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'query', name: 'course_id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Material' } } } } }
        }
      },
      post: {
        tags: ['Materials'],
        summary: 'Buat materi',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['course_id', 'title'],
                properties: {
                  course_id: { type: 'integer' },
                  title: { type: 'string' },
                  short_description: { type: 'string' },
                  full_description: { type: 'string' },
                  video_url: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/Material' } } } }
        }
      }
    },
    '/materials/{id}': {
      get: {
        tags: ['Materials'],
        summary: 'Detail materi',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Material' } } } },
          404: { description: 'Tidak ditemukan' }
        }
      },
      put: {
        tags: ['Materials'],
        summary: 'Perbarui materi',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  short_description: { type: 'string' },
                  full_description: { type: 'string' },
                  video_url: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Berhasil diperbarui' } }
      },
      delete: {
        tags: ['Materials'],
        summary: 'Hapus materi',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Dihapus' } }
      }
    },
    '/quizzes': {
      get: {
        tags: ['Quizzes'],
        summary: 'Daftar kuis',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'query', name: 'course_id', required: false, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Quiz' } } } } }
        }
      },
      post: {
        tags: ['Quizzes'],
        summary: 'Buat kuis',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['course_id', 'title'],
                properties: {
                  course_id: { type: 'integer' },
                  title: { type: 'string' },
                  short_description: { type: 'string' },
                  total_questions: { type: 'integer', default: 0 },
                  duration_minutes: { type: 'integer', default: 10 },
                  passing_score: { type: 'integer', default: 70 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } } } }
      }
    },
    '/quizzes/{id}': {
      get: {
        tags: ['Quizzes'],
        summary: 'Detail kuis + soal',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } } }, 404: { description: 'Tidak ditemukan' } }
      },
      put: {
        tags: ['Quizzes'],
        summary: 'Perbarui kuis',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  short_description: { type: 'string' },
                  total_questions: { type: 'integer' },
                  duration_minutes: { type: 'integer' },
                  passing_score: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Berhasil diperbarui' } }
      },
      delete: {
        tags: ['Quizzes'],
        summary: 'Hapus kuis',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Dihapus' } }
      }
    },
    '/quiz-attempts': {
      get: {
        tags: ['Quiz Attempts'],
        summary: 'Daftar attempt',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'quiz_id', schema: { type: 'integer' } },
          { in: 'query', name: 'student_id', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/QuizAttempt' } } } } }
        }
      },
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Mulai attempt',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quiz_id', 'student_id'],
                properties: {
                  quiz_id: { type: 'integer' },
                  student_id: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Attempt dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/QuizAttempt' } } } } }
      }
    },
    '/quiz-attempts/{id}': {
      get: {
        tags: ['Quiz Attempts'],
        summary: 'Detail attempt',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/QuizAttempt' } } } }, 404: { description: 'Tidak ditemukan' } }
      }
    },
    '/quiz-attempts/{id}/answers': {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Submit jawaban',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['question_id', 'selected_option_id'],
                properties: {
                  question_id: { type: 'integer' },
                  selected_option_id: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Jawaban tercatat' } }
      }
    },
    '/quiz-attempts/{id}/finish': {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Selesaikan attempt dan hitung skor',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Nilai akhir',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Quiz completed' },
                    score: { type: 'integer', example: 85 },
                    passed: { type: 'boolean', example: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/library': {
      get: {
        tags: ['Library'],
        summary: 'Daftar resource',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'query', name: 'course_id', required: false, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LibraryItem' } } } } }
        }
      },
      post: {
        tags: ['Library'],
        summary: 'Tambah resource',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'type', 'course_id', 'file_url'],
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string', enum: ['ebook', 'catatan', 'bank_soal'] },
                  short_description: { type: 'string' },
                  course_id: { type: 'integer' },
                  file_url: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/LibraryItem' } } } } }
      }
    },
    '/library/{id}': {
      get: {
        tags: ['Library'],
        summary: 'Detail resource',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/LibraryItem' } } } }, 404: { description: 'Tidak ditemukan' } }
      },
      put: {
        tags: ['Library'],
        summary: 'Perbarui resource',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string', enum: ['ebook', 'catatan', 'bank_soal'] },
                  short_description: { type: 'string' },
                  file_url: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Berhasil diperbarui' } }
      },
      delete: {
        tags: ['Library'],
        summary: 'Hapus resource',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Dihapus' } }
      }
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Cek status API',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
