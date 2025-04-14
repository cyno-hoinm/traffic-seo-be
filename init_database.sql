

INSERT INTO public.roles (id,"name","isDeleted","createdAt","updatedAt") VALUES
	 (1,'Admin',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,'Client',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');
	 INSERT INTO public.permissions (id,"name","createdAt","isDeleted","updatedAt") VALUES
	 (1,'Manage_Users','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07'),
	 (2,'View_Campaigns','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07'),
	 (3,'Create_Deposits','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07');
INSERT INTO public."rolePermissions" (id,"roleId","permissionId","isDeleted","createdAt","updatedAt") VALUES
	 (1,1,1,false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,2,2,false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');

INSERT INTO public.users (id,username,"password",email,"roleId","isDeleted","createdAt","updatedAt") VALUES
	 (1,'admin1','$2b$10$abc123hashedpassword','admin1@example.com',1,false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,'client1','$2b$10$xyz789hashedpassword','client1@example.com',2,false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (3,'cyno-anhntt','$2b$10$2iFIGK6WC5JgI/03kXeliuKwi3u31u04VJ9xiBAOmmnmSMZzolQpe','anhntt.cyno@gmail.com',1,false,'2025-04-14 10:40:48.826+07','2025-04-14 10:40:48.829+07');
INSERT INTO public.wallets (id,"userId",balance,"createdAt","isDeleted","updatedAt") VALUES
	 (1,1,1000.00,'2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07'),
	 (2,2,500.00,'2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07');
		 INSERT INTO public."paymentMethods" (id,"name","createdAt","isDeleted","updatedAt") VALUES
	 (1,'Credit Card','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07'),
	 (2,'PayPal','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07');
	INSERT INTO public.vouchers (id,code,value,status,"isDeleted","createdAt","updatedAt") VALUES
	 (1,'SPRING25',50.00,'ACTIVE'::public."enum_vouchers_status",false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,'SUMMER25',30.00,'ACTIVE'::public."enum_vouchers_status",false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');
INSERT INTO public.deposits (id,"userId","voucherId","paymentMethodId",amount,status,"acceptedBy","createdBy","isDeleted","createdAt","updatedAt") VALUES
	 (1,1,NULL,1,300.00,'COMPLETED'::public."enum_deposits_status",'1','1',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,2,2,2,200.00,'COMPLETED'::public."enum_deposits_status",'1','2',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');
INSERT INTO public.notifications (id,"userId","name","content","type","isDeleted","createdAt") VALUES
	 (1,1,'Campaign Started','Your SEO campaign has started.','INFO',false,'2025-04-13 20:00:00+07'),
	 (2,2,'Campaign Started','Your PPC campaign has started.','INFO',false,'2025-04-13 20:00:00+07');





INSERT INTO public.transactions (id,"walletId",amount,status,"isDeleted","createdAt","updatedAt") VALUES
	 (1,1,200.00,'PAY'::public."enum_transactions_status",false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,2,50.00,'REFUND'::public."enum_transactions_status",false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');

INSERT INTO public."campaignTypes" (id,"name","isDeleted","createdAt","updatedAt") VALUES
	 (1,'SEO',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,'PPC',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');
INSERT INTO public.countries (id,"name","createdAt","isDeleted","updatedAt") VALUES
	 (1,'USA','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07'),
	 (2,'Canada','2025-04-13 20:00:00+07',false,'2025-04-13 20:00:00+07');
	 INSERT INTO public.campaigns (id,"userId","countryId","name","campaignTypeId",device,"timeCode","startDate","endDate","totalTraffic","cost","domain","search",status,"isDeleted","createdAt","updatedAt") VALUES
	 (1,1,1,'USA SEO Campaign',1,NULL,'SPRING2025','2025-04-14 00:00:00+07','2025-05-14 00:00:00+07',1000,200.00,'example.com','seo tools','ACTIVE'::public."enum_campaigns_status",false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,2,2,'Canada PPC Campaign',2,NULL,'SUMMER2025','2025-04-15 00:00:00+07','2025-05-15 00:00:00+07',500,150.00,'example.ca','ppc ads','ACTIVE'::public."enum_campaigns_status",false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');

INSERT INTO public.keywords (id,"campaignId","name",url,distribution,traffic,"isDeleted","createdAt","updatedAt") VALUES
	 (1,1,'seo optimization','{https://example.com/seo}','DAY'::public."enum_keywords_distribution",500,false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,2,'ppc advertising','{https://example.ca/ppc}','DAY'::public."enum_keywords_distribution",200,false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');
INSERT INTO public.links (id,"campaignId",link,"linkTo",distribution,traffic,"anchorText",status,url,page,"isDeleted","createdAt","updatedAt") VALUES
	 (1,1,'https://example.com/link1','Homepage','DAY',400,'SEO Services','ACTIVE'::public."enum_links_status",'https://example.com','SEO Services',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07'),
	 (2,2,'https://example.ca/link2','Ads Page','DAY',100,'PPC Ads','ACTIVE'::public."enum_links_status",'https://example.ca/ads','SEO Services',false,'2025-04-13 20:00:00+07','2025-04-13 20:00:00+07');

