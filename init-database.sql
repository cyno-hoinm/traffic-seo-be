INSERT INTO public.configs (id,"name",value,"createdAt","updatedAt") VALUES
	 (2,'VND_TO_CREDIT','26000','2025-04-22 11:14:03+07','2025-04-22 11:14:03+07'),
	 (3,'USD_TO_CREDIT','1','2025-04-22 11:14:22.944+07','2025-04-22 11:14:22.945+07'),
	 (4,'MAX_CAMPAIGN','5','2025-04-22 11:14:57.002+07','2025-04-22 11:14:57.002+07'),
	 (1,'APP_NAME','Auto Ranked','2025-04-22 11:11:09.574+07','2025-04-22 11:19:29.101+07');
INSERT INTO public.countries (id,"name","createdAt","isDeleted","updatedAt") VALUES
	 (1,'Thailand','2025-04-22 10:16:00.254+07',false,'2025-04-22 10:16:00.254+07');
INSERT INTO public.deposits (id,"orderId","userId","voucherId","paymentMethodId",amount,status,"acceptedBy","createdBy","isDeleted","createdAt","updatedAt") VALUES
	 (5,'1032093335',3,1,3,10000.00,'COMPLETED'::public.enum_deposits_status,'system',2,false,'2025-04-22 12:51:54.163+07','2025-04-22 12:51:54.165+07'),
	 (6,'892866994',3,1,3,10000.00,'COMPLETED'::public.enum_deposits_status,'system',2,false,'2025-04-22 12:55:57.147+07','2025-04-22 12:55:57.148+07');
INSERT INTO public."paymentMethods" (id,"name",unit,"createdAt","isDeleted","updatedAt") VALUES
	 (2,'PayPal','USDD','2025-04-22 17:34:35.538+07',false,'2025-04-22 17:34:35.538+07'),
	 (3,'PayOS','VND','2025-04-22 17:34:35.538+07',false,'2025-04-22 17:34:35.538+07'),
	 (1,'USDT','USD','2025-04-22 17:34:35.538+07',false,'2025-04-22 17:34:35.538+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (11,'read wallets','read-wallets','2025-04-22 17:34:33.809876+07',false,'2025-04-22 17:34:33.809876+07'),
	 (12,'read wallet','read-wallet','2025-04-22 17:34:33.854585+07',false,'2025-04-22 17:34:33.854585+07'),
	 (13,'update wallet','update-wallet','2025-04-22 17:34:33.894854+07',false,'2025-04-22 17:34:33.894854+07'),
	 (15,'delete wallet','delete-wallet','2025-04-22 17:34:33.934846+07',false,'2025-04-22 17:34:33.934846+07'),
	 (17,'create voucher','create-voucher','2025-04-22 17:34:33.973884+07',false,'2025-04-22 17:34:33.973884+07'),
	 (19,'read vouchers','read-vouchers','2025-04-22 17:34:34.02973+07',false,'2025-04-22 17:34:34.02973+07'),
	 (21,'read voucher','read-voucher','2025-04-22 17:34:34.084255+07',false,'2025-04-22 17:34:34.084255+07'),
	 (23,'update voucher','update-voucher','2025-04-22 17:34:34.132243+07',false,'2025-04-22 17:34:34.132243+07'),
	 (24,'delete voucher','delete-voucher','2025-04-22 17:34:34.189651+07',false,'2025-04-22 17:34:34.189651+07'),
	 (26,'search users','search-users','2025-04-22 17:34:34.270688+07',false,'2025-04-22 17:34:34.270688+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (27,'create user','create-user','2025-04-22 17:34:34.324062+07',false,'2025-04-22 17:34:34.324062+07'),
	 (28,'read user','read-user','2025-04-22 17:34:34.388144+07',false,'2025-04-22 17:34:34.388144+07'),
	 (30,'read users','read-users','2025-04-22 17:34:34.43358+07',false,'2025-04-22 17:34:34.43358+07'),
	 (31,'update user','update-user','2025-04-22 17:34:34.494028+07',false,'2025-04-22 17:34:34.494028+07'),
	 (33,'delete user','delete-user','2025-04-22 17:34:34.534299+07',false,'2025-04-22 17:34:34.534299+07'),
	 (35,'create transaction','create-transaction','2025-04-22 17:34:34.575298+07',false,'2025-04-22 17:34:34.575298+07'),
	 (36,'search transactions','search-transactions','2025-04-22 17:34:34.618778+07',false,'2025-04-22 17:34:34.618778+07'),
	 (38,'read transaction','read-transaction','2025-04-22 17:34:34.661287+07',false,'2025-04-22 17:34:34.661287+07'),
	 (39,'create role','create-role','2025-04-22 17:34:34.698722+07',false,'2025-04-22 17:34:34.698722+07'),
	 (41,'read role','read-role','2025-04-22 17:34:34.742407+07',false,'2025-04-22 17:34:34.742407+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (43,'read roles','read-roles','2025-04-22 17:34:34.78288+07',false,'2025-04-22 17:34:34.78288+07'),
	 (44,'update role','update-role','2025-04-22 17:34:34.820057+07',false,'2025-04-22 17:34:34.820057+07'),
	 (46,'delete role','delete-role','2025-04-22 17:34:34.858453+07',false,'2025-04-22 17:34:34.858453+07'),
	 (48,'create role permission','create-role-permission','2025-04-22 17:34:34.896766+07',false,'2025-04-22 17:34:34.896766+07'),
	 (50,'read role permission','read-role-permission','2025-04-22 17:34:34.934129+07',false,'2025-04-22 17:34:34.934129+07'),
	 (52,'read role permissions','read-role-permissions','2025-04-22 17:34:34.989453+07',false,'2025-04-22 17:34:34.989453+07'),
	 (55,'update role permission','update-role-permission','2025-04-22 17:34:35.049233+07',false,'2025-04-22 17:34:35.049233+07'),
	 (57,'delete role permission','delete-role-permission','2025-04-22 17:34:35.107089+07',false,'2025-04-22 17:34:35.107089+07'),
	 (59,'read report','read-report','2025-04-22 17:34:35.153434+07',false,'2025-04-22 17:34:35.153434+07'),
	 (60,'create permission','create-permission','2025-04-22 17:34:35.192431+07',false,'2025-04-22 17:34:35.192431+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (62,'read permission','read-permission','2025-04-22 17:34:35.240294+07',false,'2025-04-22 17:34:35.240294+07'),
	 (65,'read permissions','read-permissions','2025-04-22 17:34:35.293002+07',false,'2025-04-22 17:34:35.293002+07'),
	 (66,'update permission','update-permission','2025-04-22 17:34:35.345629+07',false,'2025-04-22 17:34:35.345629+07'),
	 (68,'delete permission','delete-permission','2025-04-22 17:34:35.395893+07',false,'2025-04-22 17:34:35.395893+07'),
	 (71,'search links','search-links','2025-04-22 17:34:35.458516+07',false,'2025-04-22 17:34:35.458516+07'),
	 (73,'create link','create-link','2025-04-22 17:34:35.497935+07',false,'2025-04-22 17:34:35.497935+07'),
	 (74,'read link','read-link','2025-04-22 17:34:35.538986+07',false,'2025-04-22 17:34:35.538986+07'),
	 (77,'update link','update-link','2025-04-22 17:34:35.593085+07',false,'2025-04-22 17:34:35.593085+07'),
	 (78,'search keywords','search-keywords','2025-04-22 17:34:35.634013+07',false,'2025-04-22 17:34:35.634013+07'),
	 (80,'create keyword','create-keyword','2025-04-22 17:34:35.674025+07',false,'2025-04-22 17:34:35.674025+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (82,'read keyword','read-keyword','2025-04-22 17:34:35.718959+07',false,'2025-04-22 17:34:35.718959+07'),
	 (84,'update keyword','update-keyword','2025-04-22 17:34:35.758563+07',false,'2025-04-22 17:34:35.758563+07'),
	 (86,'search deposits','search-deposits','2025-04-22 17:34:35.798193+07',false,'2025-04-22 17:34:35.798193+07'),
	 (88,'create deposit','create-deposit','2025-04-22 17:34:35.839244+07',false,'2025-04-22 17:34:35.839244+07'),
	 (90,'Đọc Tiền gửi (Quản trị)','read-deposit-admin','2025-04-22 17:34:35.877136+07',false,'2025-04-22 17:34:35.877136+07'),
	 (92,'Đọc Tiền gửi (Người dùng)','read-deposit-user','2025-04-22 17:34:35.919756+07',false,'2025-04-22 17:34:35.919756+07'),
	 (94,'create country','create-country','2025-04-22 17:34:35.960163+07',false,'2025-04-22 17:34:35.960163+07'),
	 (96,'read countries','read-countries','2025-04-22 17:34:36.003064+07',false,'2025-04-22 17:34:36.003064+07'),
	 (98,'read country','read-country','2025-04-22 17:34:36.045843+07',false,'2025-04-22 17:34:36.045843+07'),
	 (100,'update country','update-country','2025-04-22 17:34:36.088872+07',false,'2025-04-22 17:34:36.088872+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (102,'delete country','delete-country','2025-04-22 17:34:36.152768+07',false,'2025-04-22 17:34:36.152768+07'),
	 (104,'read bot keywords','read-bot-keywords','2025-04-22 17:34:36.233855+07',false,'2025-04-22 17:34:36.233855+07'),
	 (105,'create-notification','create-notification','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (106,'search-notifications','search-notifications','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (107,'read-config','read-config','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (108,'create-config','create-config','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (109,'update-config','update-config','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (110,'delete-config','delete-config','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (111,'search-campaigns','search-campaigns','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07'),
	 (112,'create-campaign','create-campaign','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07');
INSERT INTO public.permissions (id,"name",code,"createdAt","isDeleted","updatedAt") VALUES
	 (113,'read-campaign','read-campaign','2025-04-22 17:34:36.233+07',false,'2025-04-22 17:34:36.233+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (1,1,90,false,'2025-04-22 10:52:16.116+07','2025-04-22 10:52:16.12+07'),
	 (2,1,88,false,'2025-04-22 10:52:17.172+07','2025-04-22 10:52:17.172+07'),
	 (3,1,86,false,'2025-04-22 10:52:17.905+07','2025-04-22 10:52:17.905+07'),
	 (4,1,84,false,'2025-04-22 10:52:18.791+07','2025-04-22 10:52:18.791+07'),
	 (5,1,82,false,'2025-04-22 10:52:19.708+07','2025-04-22 10:52:19.708+07'),
	 (6,1,80,false,'2025-04-22 10:52:20.304+07','2025-04-22 10:52:20.304+07'),
	 (7,1,78,false,'2025-04-22 10:52:21.29+07','2025-04-22 10:52:21.29+07'),
	 (8,1,77,false,'2025-04-22 10:52:22.021+07','2025-04-22 10:52:22.021+07'),
	 (9,1,74,false,'2025-04-22 10:52:23.501+07','2025-04-22 10:52:23.501+07'),
	 (10,1,73,false,'2025-04-22 10:52:24.149+07','2025-04-22 10:52:24.149+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (11,1,71,false,'2025-04-22 10:52:25.156+07','2025-04-22 10:52:25.156+07'),
	 (12,1,68,false,'2025-04-22 10:52:26.424+07','2025-04-22 10:52:26.424+07'),
	 (13,1,59,false,'2025-04-22 10:53:14.295+07','2025-04-22 10:53:14.297+07'),
	 (14,1,60,false,'2025-04-22 10:53:15.212+07','2025-04-22 10:53:15.212+07'),
	 (15,1,62,false,'2025-04-22 10:53:16.019+07','2025-04-22 10:53:16.019+07'),
	 (16,1,65,false,'2025-04-22 10:53:16.835+07','2025-04-22 10:53:16.835+07'),
	 (17,1,66,false,'2025-04-22 10:53:17.555+07','2025-04-22 10:53:17.555+07'),
	 (18,1,104,false,'2025-04-22 10:53:18.435+07','2025-04-22 10:53:18.435+07'),
	 (19,1,102,false,'2025-04-22 10:53:18.953+07','2025-04-22 10:53:18.953+07'),
	 (20,1,100,false,'2025-04-22 10:53:19.474+07','2025-04-22 10:53:19.475+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (21,1,98,false,'2025-04-22 10:53:19.983+07','2025-04-22 10:53:19.983+07'),
	 (22,1,96,false,'2025-04-22 10:53:20.616+07','2025-04-22 10:53:20.616+07'),
	 (23,1,94,false,'2025-04-22 10:53:21.74+07','2025-04-22 10:53:21.74+07'),
	 (24,1,92,false,'2025-04-22 10:53:22.3+07','2025-04-22 10:53:22.301+07'),
	 (25,1,43,false,'2025-04-22 10:53:24.257+07','2025-04-22 10:53:24.257+07'),
	 (26,1,44,false,'2025-04-22 10:53:25.023+07','2025-04-22 10:53:25.024+07'),
	 (27,1,46,false,'2025-04-22 10:53:25.974+07','2025-04-22 10:53:25.974+07'),
	 (28,1,48,false,'2025-04-22 10:53:26.641+07','2025-04-22 10:53:26.641+07'),
	 (29,1,50,false,'2025-04-22 10:53:27.273+07','2025-04-22 10:53:27.273+07'),
	 (30,1,57,false,'2025-04-22 10:54:34.912+07','2025-04-22 10:54:34.912+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (31,1,55,false,'2025-04-22 10:54:35.857+07','2025-04-22 10:54:35.857+07'),
	 (32,1,52,false,'2025-04-22 10:54:36.996+07','2025-04-22 10:54:36.996+07'),
	 (33,1,38,false,'2025-04-22 10:54:37.864+07','2025-04-22 10:54:37.864+07'),
	 (34,1,39,false,'2025-04-22 10:54:38.59+07','2025-04-22 10:54:38.59+07'),
	 (35,1,41,false,'2025-04-22 10:54:39.638+07','2025-04-22 10:54:39.638+07'),
	 (36,1,36,false,'2025-04-22 10:54:40.608+07','2025-04-22 10:54:40.608+07'),
	 (37,1,35,false,'2025-04-22 10:54:41.704+07','2025-04-22 10:54:41.704+07'),
	 (38,1,33,false,'2025-04-22 10:54:42.457+07','2025-04-22 10:54:42.458+07'),
	 (39,1,31,false,'2025-04-22 10:54:43.441+07','2025-04-22 10:54:43.441+07'),
	 (40,1,30,false,'2025-04-22 10:54:44.285+07','2025-04-22 10:54:44.285+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (41,1,17,false,'2025-04-22 10:54:45.103+07','2025-04-22 10:54:45.103+07'),
	 (42,1,19,false,'2025-04-22 10:54:45.768+07','2025-04-22 10:54:45.768+07'),
	 (43,1,21,false,'2025-04-22 10:54:46.734+07','2025-04-22 10:54:46.734+07'),
	 (44,1,23,false,'2025-04-22 10:54:47.485+07','2025-04-22 10:54:47.485+07'),
	 (45,1,24,false,'2025-04-22 10:54:48.138+07','2025-04-22 10:54:48.138+07'),
	 (46,1,26,false,'2025-04-22 10:54:48.937+07','2025-04-22 10:54:48.937+07'),
	 (47,1,27,false,'2025-04-22 10:54:49.625+07','2025-04-22 10:54:49.625+07'),
	 (48,1,28,false,'2025-04-22 10:54:50.621+07','2025-04-22 10:54:50.622+07'),
	 (49,1,15,false,'2025-04-22 10:54:51.452+07','2025-04-22 10:54:51.452+07'),
	 (50,1,13,false,'2025-04-22 10:54:52.185+07','2025-04-22 10:54:52.186+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (51,1,12,false,'2025-04-22 10:54:53.143+07','2025-04-22 10:54:53.144+07'),
	 (52,1,11,false,'2025-04-22 10:54:54.127+07','2025-04-22 10:54:54.127+07'),
	 (53,1,107,false,'2025-04-22 11:09:59.472+07','2025-04-22 11:09:59.473+07'),
	 (54,1,108,false,'2025-04-22 11:10:00.55+07','2025-04-22 11:10:00.55+07'),
	 (55,1,109,false,'2025-04-22 11:10:01.387+07','2025-04-22 11:10:01.387+07'),
	 (56,1,110,false,'2025-04-22 11:10:01.979+07','2025-04-22 11:10:01.979+07'),
	 (57,1,111,false,'2025-04-22 11:10:02.645+07','2025-04-22 11:10:02.645+07'),
	 (58,1,112,false,'2025-04-22 11:10:03.428+07','2025-04-22 11:10:03.428+07'),
	 (59,1,113,false,'2025-04-22 11:10:04.205+07','2025-04-22 11:10:04.205+07'),
	 (60,1,105,false,'2025-04-22 11:10:05.116+07','2025-04-22 11:10:05.116+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (61,1,106,false,'2025-04-22 11:10:06.012+07','2025-04-22 11:10:06.012+07');
INSERT INTO public.roles (id,"name","isDeleted","createdAt","updatedAt") VALUES
	 (1,'admin',false,'2025-04-22 10:10:54.733+07','2025-04-22 10:10:54.735+07'),
	 (2,'customer',false,'2025-04-22 10:11:05.022+07','2025-04-22 10:11:05.023+07');
INSERT INTO public.transactions (id,"walletId",amount,status,"type","referenceId","isDeleted","createdAt","updatedAt") VALUES
	 (1,1,0.38,'COMPLETED'::public.enum_transactions_status,'DEPOSIT'::public.enum_transactions_type,'1032093335',false,'2025-04-22 12:51:54.864+07','2025-04-22 12:51:54.864+07'),
	 (2,1,0.38,'COMPLETED'::public.enum_transactions_status,'DEPOSIT'::public.enum_transactions_type,'892866994',false,'2025-04-22 12:55:57.693+07','2025-04-22 12:55:57.694+07');
INSERT INTO public.users (id,username,"password",email,"roleId","isDeleted","createdAt","updatedAt") VALUES
	 (2,'minhhoi','$2b$10$EEXsHr.jDXdUmxRH8M7Nxu3sEh50ghIDWl1IHXJEFmSajMwcq/3le','emcuahoi1223@gmail.com',1,false,'2025-04-22 10:12:42.47+07','2025-04-22 10:12:42.471+07'),
	 (3,'user','$2b$10$G3RRiAB9rkBB7H5Znh32Ke0EnS2D54l.eSo.QEYxtCtSM9TPrZ3zS','emlahoi1223@gmail.com',2,false,'2025-04-22 10:12:55.775+07','2025-04-22 10:12:55.775+07');
INSERT INTO public.vouchers (id,code,value,status,"isDeleted","createdAt","updatedAt") VALUES
	 (1,'MJ4PJPFT0O',0.00,'ACTIVE'::public.enum_vouchers_status,false,'2025-04-22 10:15:36.332+07','2025-04-22 10:15:36.335+07');
INSERT INTO public.wallets (id,"userId",balance,"createdAt","isDeleted","updatedAt") VALUES
	 (1,3,0.76,'2025-04-22 10:12:55.859+07',false,'2025-04-22 12:55:57.74+07');
