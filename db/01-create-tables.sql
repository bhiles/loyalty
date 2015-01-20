 CREATE TABLE p_user (
       id         bigserial PRIMARY KEY,
       email      varchar(120) NOT NULL,
       firstName  varchar(120) NOT NULL,
       lastName   varchar(120) NOT NULL,
       points     bigint DEFAULT 0
);

CREATE TABLE tx (
       p_user_id bigint NOT NULL,
       amount    bigint NOT NULL
);
