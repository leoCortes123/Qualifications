SELECT
    e.id,
    e.date,
    e."group",
    e.activity,
    e.idUser,
    u.name AS userName,
    e.idUserAfected,
    ua.name AS affectedUserName,
    e.substate
FROM registrations e
JOIN users u ON u.id = e.idUser
LEFT JOIN users ua ON ua.id = e.idUserAfected
WHERE
    e.substate = 2
    AND e.activity LIKE 'ga%'
    AND e.activity LIKE '%220501096%'
    AND SUBSTR(e.activity, 3, 1) IN ('6','7', '8', '9', '10')
    AND e.date = (
        SELECT MAX(e2.date)
        FROM registrations e2
        WHERE e2."group" = e."group"
          AND e2.activity = e.activity
          AND e2.idUser = e.idUser
    )
    AND NOT EXISTS (
        SELECT 1
        FROM registrations e3
        WHERE e3."group" = e."group"
          AND e3.activity = e.activity
          AND e3.idUserAfected = e.idUser
          AND e3.substate = 1
          AND e3.date >= e.date
    )
ORDER BY e."group", e.activity asc, e.date DESC, e.idUser;

/*
drop table users;
drop table registrations;

*/

