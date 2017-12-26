<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require_once 'vendor/autoload.php';
include_once 'Core/Engine.php';
include_once 'Configuration.php';
include_once 'Controllers/APIController.php';

/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 22/01/17
 * Time: 16:12
 */
Engine::$DEBUG = true;
date_default_timezone_set ("Europe/Paris");
Engine::Instance()->setPersistence(new DatabaseStorage(Configuration::$DB_hostname, Configuration::$DB_name, Configuration::$DB_username, Configuration::$DB_password));

$config = [
    'settings' => [
        'displayErrorDetails' => true,
        'determineRouteBeforeAppMiddleware' => true,
    ],
];


$app = new \Slim\App($config);


// Ajout du middleware
$app->add(function(Request $request, Response $response, $next){
    return Controller::routeHandler($request, $response, $next);
});

// Définition des routes

$app->any('/v1.0/{collection}', function (Request $request, Response $response, $args) {
    $collection = ucfirst($args["collection"]);
    $operation = ucfirst($request->getMethod());
    $params = null;
    if($request->isGet())
    {
        $operation = "GetAll";
        $params = $request->getQueryParams();
    }
    else
        $params = $request->getParsedBody();
    return APIController::Execute($collection, $operation, $params, $response);
});

$app->any('/v1.0/{collection}/{id}', function(Request $request, Response $response, $args)
{
    $collection = ucfirst($args["collection"]);
    $operation = ucfirst($request->getMethod());
    $params = null;
    if($request->isGet())
    {
        $params = $request->getQueryParams();
    }
    else
        $params = $request->getParsedBody();
    $params["id"] = $args["id"];
    return APIController::Execute($collection, $operation, $params, $response);

});



$app->run();

