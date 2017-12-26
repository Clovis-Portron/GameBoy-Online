<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require_once 'vendor/autoload.php';

/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 22/01/17
 * Time: 16:15
 */
class Controller
{
    /**
     * @param Request $request
     * @param Response $response
     * @param $next
     * @return Response|static
     */
    public static function routeHandler(Request $request, Response $response, $next)
    {
        $response = $response->withHeader("Content-Type", "application/json");
        $response = $response->withHeader("Access-Control-Allow-Origin", "*");
        $response = $response->withHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, PATCH, OPTIONS");
        $response = $response->withHeader("Access-Control-Allow-Headers", "*");
        //$response = $response->withHeader("Content-Encoding", "deflate");
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone(DateTimeZone::listIdentifiers(DateTimeZone::UTC)[0]));
        $response = $response->withHeader("Date", $date->format(DATE_RFC822));
        $route = $request->getAttribute("route");

        if($request->isOptions())
            return $response;

        try {
            if (empty($route)) {
                throw new Exception();
            }
            $response = $next($request, $response, $route->getArguments());
        }
        catch(Exception $e)
        {
            $error = [];
            $error["error"] = [];
            $error["error"]["code"] = $e->getCode();
            $error["error"]["message"] = $e->getMessage();
            $error["error"]["details"] = [];
            $error["error"]["details"]["trace"] = [$e->getTraceAsString()];
            $response = $response->withBody(new \Slim\Http\Body(fopen('php://temp', 'w+')));
            $response->getBody()->write(json_encode($error));
        }

        return $response;
    }
}
