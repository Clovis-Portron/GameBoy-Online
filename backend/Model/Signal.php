<?php
/**
 * Created by PhpStorm.
 * User: Clovis
 * Date: 30/10/2017
 * Time: 19:53
 */

class Signal extends StorageItem
{
    /**
     * @Required
     * @Numeric
     */
    public date;

    /**
     * @Word
     */
    public password;

    /**
     * @Word
     */
    public offer;

    /**
     * @Word
     */
    public description;

    /**
     * @Word
     */
    public candidate;
    

    /**
     * @return mixed
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * @param mixed 
     */
    public function setDate($date)
    {
        $this->date = $date;
        $this->checkIntegrity("date");
    }

    /**
     * @return mixed
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param mixed 
     */
    public function setPassword($password)
    {
        $this->password = $password;
        $this->checkIntegrity("password");
    }

    /**
     * @return mixed
     */
    public function getOffer()
    {
        return $this->offer;
    }

    /**
     * @param mixed 
     */
    public function setOffer($offer)
    {
        $this->password = $offer;
        $this->checkIntegrity("offer");
    }

        /**
     * @return mixed
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param mixed 
     */
    public function setDescription($description)
    {
        $this->description = $description;
        $this->checkIntegrity("description");
    }

        /**
     * @return mixed
     */
    public function getCandidate()
    {
        return $this->candidate;
    }

    /**
     * @param mixed 
     */
    public function setCandidate($candidate)
    {
        $this->candidate = $candidate;
        $this->checkIntegrity("candidate");
    }
}